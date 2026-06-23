import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

const VALID_TYPES = ['Entity', 'Statement', 'Scope', 'Reference', 'Idea'];

// List with filters
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { type, subtype, domain, search, math_idea } = req.query;

  let query = 'SELECT DISTINCT n.* FROM nodes n';
  const params: Record<string, string> = {};
  const joins: string[] = [];
  const conditions: string[] = [];

  if (domain) {
    joins.push('JOIN node_domains nd ON n.id = nd.node_id JOIN domains d ON nd.domain_id = d.id');
    params.domain = `%${domain}%`;
    conditions.push('(d.name LIKE @domain OR d.id = @domain_exact)');
    params.domain_exact = domain as string;
  }
  if (math_idea) {
    joins.push('JOIN node_math_ideas nmi ON n.id = nmi.node_id JOIN math_ideas mi ON nmi.idea_id = mi.id');
    params.math_idea = `%${math_idea}%`;
    conditions.push('(mi.name LIKE @math_idea OR mi.id = @math_idea_exact)');
    params.math_idea_exact = math_idea as string;
  }
  if (type) {
    conditions.push('n.type = @type');
    params.type = type as string;
  }
  if (subtype) {
    conditions.push('n.subtype = @subtype');
    params.subtype = subtype as string;
  }
  if (search) {
    conditions.push('n.id IN (SELECT rowid FROM nodes_fts WHERE nodes_fts MATCH @search)');
    params.search = `"${search}"`;
  }

  query += ' ' + joins.join(' ');
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY n.created_at DESC';

  res.json(db.prepare(query).all(params));
});

// Get single node
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(req.params.id);
  if (!node) { res.status(404).json({ error: '节点不存在' }); return; }

  const n = node as any;
  const properties = db.prepare(
    'SELECT p.* FROM properties p JOIN node_properties np ON p.id = np.property_id WHERE np.node_id = ?'
  ).all(req.params.id);

  const proofs = db.prepare(
    'SELECT * FROM proofs WHERE theorem_id = ? ORDER BY is_primary DESC, created_at ASC'
  ).all(req.params.id);

  const domains = db.prepare(
    'SELECT d.* FROM domains d JOIN node_domains nd ON d.id = nd.domain_id WHERE nd.node_id = ?'
  ).all(req.params.id);

  const mathIdeas = db.prepare(
    'SELECT mi.* FROM math_ideas mi JOIN node_math_ideas nmi ON mi.id = nmi.idea_id WHERE nmi.node_id = ?'
  ).all(req.params.id);

  // Group members (for expandable nodes)
  const groupMembers = db.prepare(
    'SELECT n.*, gm.sort_order FROM group_members gm JOIN nodes n ON gm.member_id = n.id WHERE gm.group_id = ? ORDER BY gm.sort_order'
  ).all(req.params.id);

  // Parent groups
  const parentGroups = db.prepare(
    'SELECT n.* FROM nodes n JOIN group_members gm ON n.id = gm.group_id WHERE gm.member_id = ?'
  ).all(req.params.id);

  res.json({ ...n, properties, proofs, domains, mathIdeas, groupMembers, parentGroups });
});

// Create
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { type, subtype = '', label, description = '', truth_value, truth_context,
          scope_kind, is_exhaustive, refers_to } = req.body;

  if (!type || !VALID_TYPES.includes(type)) {
    res.status(400).json({ error: `type 必须为 ${VALID_TYPES.join('/')}` });
    return;
  }
  if (!label?.trim()) { res.status(400).json({ error: 'label 不能为空' }); return; }

  const id = uuid();
  db.prepare(`INSERT INTO nodes (id, type, subtype, label, description, truth_value, truth_context, scope_kind, is_exhaustive, refers_to)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    id, type, subtype, label.trim(), description,
    truth_value ?? null, truth_context ?? null,
    scope_kind ?? null, is_exhaustive ? 1 : 0, refers_to ?? null
  );

  // Auto-create default proof for theorem/lemma/corollary
  if (type === 'Statement' && ['theorem', 'lemma', 'corollary'].includes(subtype)) {
    const pid = uuid();
    db.prepare('INSERT INTO proofs (id, theorem_id, title, is_primary) VALUES (?,?,?,1)').run(pid, id, '默认证明');
  }

  res.status(201).json(db.prepare('SELECT * FROM nodes WHERE id = ?').get(id));
});

// Update
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM nodes WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: '节点不存在' }); return; }

  const { label, description, truth_value, truth_context, scope_kind, is_exhaustive, refers_to, subtype } = req.body;

  db.prepare(`UPDATE nodes SET label=?, description=?, truth_value=?, truth_context=?,
    scope_kind=?, is_exhaustive=?, refers_to=?, subtype=?, updated_at=datetime('now')
    WHERE id=?`).run(
    label ?? existing.label,
    description ?? existing.description,
    truth_value !== undefined ? truth_value : existing.truth_value,
    truth_context !== undefined ? truth_context : existing.truth_context,
    scope_kind !== undefined ? scope_kind : existing.scope_kind,
    is_exhaustive !== undefined ? (is_exhaustive ? 1 : 0) : existing.is_exhaustive,
    refers_to !== undefined ? refers_to : existing.refers_to,
    subtype !== undefined ? subtype : existing.subtype,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM nodes WHERE id = ?').get(req.params.id));
});

// Delete
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM nodes WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: '节点不存在' }); return; }

  const n = existing as any;
  if (n.type === 'Statement' && n.subtype === 'axiom') {
    res.status(403).json({ error: '公理不可删除' }); return;
  }

  // Check for dependents
  const deps = db.prepare(
    "SELECT DISTINCT e.source_id, sn.label FROM edges e JOIN nodes sn ON e.source_id = sn.id WHERE e.target_id = ? AND e.category = 'logic'"
  ).all(req.params.id) as any[];

  if (deps.length > 0 && req.query.force !== 'true') {
    res.status(409).json({ error: '被以下节点逻辑依赖', dependents: deps }); return;
  }

  db.prepare('DELETE FROM nodes WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

// Add / remove properties
router.post('/:id/properties', (req: Request, res: Response) => {
  const db = getDb();
  const { propertyId } = req.body;
  if (!propertyId) { res.status(400).json({ error: 'propertyId 必填' }); return; }
  try { db.prepare('INSERT INTO node_properties (node_id, property_id) VALUES (?,?)').run(req.params.id, propertyId); }
  catch { /* already exists */ }
  res.status(201).json({ added: true });
});

router.delete('/:id/properties/:propertyId', (req: Request, res: Response) => {
  getDb().prepare('DELETE FROM node_properties WHERE node_id=? AND property_id=?').run(req.params.id, req.params.propertyId);
  res.json({ removed: true });
});

// Neighbors
router.get('/:id/neighbors', (req: Request, res: Response) => {
  const db = getDb();
  const incoming = db.prepare(
    'SELECT e.*, n.label as source_label, n.type as source_type FROM edges e JOIN nodes n ON e.source_id=n.id WHERE e.target_id=?'
  ).all(req.params.id);
  const outgoing = db.prepare(
    'SELECT e.*, n.label as target_label, n.type as target_type FROM edges e JOIN nodes n ON e.target_id=n.id WHERE e.source_id=?'
  ).all(req.params.id);
  res.json({ incoming, outgoing });
});

export default router;
