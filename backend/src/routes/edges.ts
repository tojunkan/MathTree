import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

const VALID_CATEGORIES = ['construction', 'logic', 'bind', 'case'];
const CONSTRUCTION_TYPES = ['is_a', 'instance_of', 'compose', 'has_property', 'define',
  'arg_1', 'arg_2', 'arg_3', 'arg_4', 'uses_template', 'result', 'substitute', 'depend_on'];
const LOGIC_TYPES = ['implies', 'equivalent', 'special_case', 'counterexample_of', 'uses_idea'];
const BIND_TYPES = ['bind'];
const CASE_TYPES = ['case'];
const ALL_EDGE_TYPES = [...CONSTRUCTION_TYPES, ...LOGIC_TYPES, ...BIND_TYPES, ...CASE_TYPES];

function edgeTypesForCategory(cat: string): string[] {
  switch (cat) {
    case 'construction': return CONSTRUCTION_TYPES;
    case 'logic': return LOGIC_TYPES;
    case 'bind': return BIND_TYPES;
    case 'case': return CASE_TYPES;
    default: return [];
  }
}

// List
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { source, target, category, edge_type, label } = req.query;
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (source) { conditions.push('e.source_id = @source'); params.source = source as string; }
  if (target) { conditions.push('e.target_id = @target'); params.target = target as string; }
  if (category) { conditions.push('e.category = @category'); params.category = category as string; }
  if (edge_type) { conditions.push('e.edge_type = @edge_type'); params.edge_type = edge_type as string; }
  if (label) { conditions.push('e.label LIKE @label'); params.label = `%${label}%`; }

  let query = `SELECT e.*, sn.label as source_label, sn.type as source_type, tn.label as target_label, tn.type as target_type
    FROM edges e JOIN nodes sn ON e.source_id=sn.id JOIN nodes tn ON e.target_id=tn.id`;
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY e.created_at DESC';

  res.json(db.prepare(query).all(params));
});

// Create
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { source_id, target_id, category, edge_type, label, description = '',
          truth_value, truth_context, scope_id, proof_id } = req.body;

  if (!source_id || !target_id) {
    res.status(400).json({ error: 'source_id 和 target_id 必填' }); return;
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    res.status(400).json({ error: `category 必须为 ${VALID_CATEGORIES.join('/')}` }); return;
  }
  const allowed = edgeTypesForCategory(category);
  if (!edge_type || !allowed.includes(edge_type)) {
    res.status(400).json({ error: `edge_type "${edge_type}" 不合法。category=${category} 允许: ${allowed.join(', ')}` }); return;
  }

  // Source/target must exist
  if (!db.prepare('SELECT 1 FROM nodes WHERE id=?').get(source_id)) {
    res.status(400).json({ error: 'source 节点不存在' }); return;
  }
  if (!db.prepare('SELECT 1 FROM nodes WHERE id=?').get(target_id)) {
    res.status(400).json({ error: 'target 节点不存在' }); return;
  }

  // No self-loop
  if (source_id === target_id) {
    res.status(400).json({ error: '不允许自环' }); return;
  }

  // Construction edges don't carry truth_value
  const tv = category === 'construction' ? null : (truth_value ?? null);

  const id = uuid();
  try {
    db.prepare(`INSERT INTO edges (id, source_id, target_id, category, edge_type, label, description,
      truth_value, truth_context, scope_id, proof_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, source_id, target_id, category, edge_type, label ?? null, description,
      tv, truth_context ?? null, scope_id ?? null, proof_id ?? null
    );
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) { res.status(409).json({ error: '边已存在' }); return; }
    throw e;
  }

  res.status(201).json(db.prepare('SELECT * FROM edges WHERE id=?').get(id));
});

// Delete
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const edge = db.prepare('SELECT * FROM edges WHERE id=?').get(req.params.id);
  if (!edge) { res.status(404).json({ error: '边不存在' }); return; }

  // Auto-generated edges by scope exit cannot be manually deleted
  if ((edge as any).derived_by_scope_exit && req.query.force !== 'true') {
    res.status(403).json({ error: '此边由作用域退出时自动生成，不可手动删除。使用 ?force=true 强制删除。' }); return;
  }

  db.prepare('DELETE FROM edges WHERE id=?').run(req.params.id);
  res.json({ deleted: true });
});

export default router;
