import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// Create a G node from selected member nodes
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { label, description = '', memberIds = [] } = req.body;

  if (!label || !label.trim()) {
    res.status(400).json({ error: 'label 不能为空' });
    return;
  }
  if (!Array.isArray(memberIds) || memberIds.length < 2) {
    res.status(400).json({ error: '至少需要 2 个成员节点' });
    return;
  }

  // Verify all members exist
  const placeholders = memberIds.map(() => '?').join(',');
  const members = db.prepare(
    `SELECT id, type, label FROM nodes WHERE id IN (${placeholders})`
  ).all(...memberIds) as { id: string; type: string; label: string }[];

  if (members.length !== memberIds.length) {
    res.status(400).json({ error: '部分成员节点不存在' });
    return;
  }

  // Compute inherited properties (intersection of all members' properties)
  const memberProps = db.prepare(`
    SELECT np.property_id
    FROM node_properties np
    WHERE np.node_id IN (${placeholders})
    GROUP BY np.property_id
    HAVING COUNT(DISTINCT np.node_id) = ?
  `).all(...memberIds, memberIds.length) as { property_id: string }[];

  const inheritedPropertyIds = memberProps.map((r) => r.property_id);

  const createAll = db.transaction(() => {
    const gid = uuid();

    // Create the G node
    db.prepare(`
      INSERT INTO nodes (id, type, label, description) VALUES (?, 'G', ?, ?)
    `).run(gid, label.trim(), description);

    // Add members
    const insertMember = db.prepare(
      `INSERT INTO group_members (group_id, member_id, sort_order) VALUES (?, ?, ?)`
    );
    memberIds.forEach((mid: string, i: number) => {
      insertMember.run(gid, mid, i);
    });

    // Inherit shared properties
    const insertProp = db.prepare(
      `INSERT OR IGNORE INTO node_properties (node_id, property_id) VALUES (?, ?)`
    );
    inheritedPropertyIds.forEach((pid: string) => {
      insertProp.run(gid, pid);
    });

    return gid;
  });

  const gid = createAll();
  const node = db.prepare(`SELECT * FROM nodes WHERE id = ?`).get(gid);
  res.status(201).json({
    ...(node as object),
    memberIds,
    inheritedProperties: inheritedPropertyIds.length,
  });
});

// Get all group memberships (flat map: member_id → group_id)
router.get('/memberships', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(`SELECT group_id, member_id FROM group_members`).all();
  res.json(rows);
});

// Get members of a G node
router.get('/:id/members', (req: Request, res: Response) => {
  const db = getDb();
  const group = db.prepare(`SELECT * FROM nodes WHERE id = ? `).get(req.params.id);

  if (!group) {
    res.status(404).json({ error: 'G 节点不存在' });
    return;
  }

  const members = db.prepare(`
    SELECT n.*, gm.sort_order
    FROM group_members gm
    JOIN nodes n ON gm.member_id = n.id
    WHERE gm.group_id = ?
    ORDER BY gm.sort_order
  `).all(req.params.id);

  // Also get internal edges (between members)
  const memberIds = members.map((m: any) => m.id);
  let internalEdges: any[] = [];
  if (memberIds.length > 0) {
    const placeholders = memberIds.map(() => '?').join(',');
    internalEdges = db.prepare(`
      SELECT e.*,
        sn.label as source_label, sn.type as source_type,
        tn.label as target_label, tn.type as target_type
      FROM edges e
      JOIN nodes sn ON e.source_id = sn.id
      JOIN nodes tn ON e.target_id = tn.id
      WHERE e.source_id IN (${placeholders})
        AND e.target_id IN (${placeholders})
    `).all(...memberIds, ...memberIds);
  }

  res.json({ group, members, internalEdges });
});

// Add a member to a G node
router.post('/:id/members', (req: Request, res: Response) => {
  const db = getDb();
  const { memberId } = req.body;

  const group = db.prepare(`SELECT * FROM nodes WHERE id = ? `).get(req.params.id);
  if (!group) {
    res.status(404).json({ error: 'G 节点不存在' });
    return;
  }

  const member = db.prepare(`SELECT * FROM nodes WHERE id = ?`).get(memberId);
  if (!member) {
    res.status(400).json({ error: '成员节点不存在' });
    return;
  }

  try {
    db.prepare(`INSERT INTO group_members (group_id, member_id) VALUES (?, ?)`)
      .run(req.params.id, memberId);
  } catch {
    return res.status(409).json({ error: '该节点已是此 G 的成员' });
  }

  // Recompute inherited properties
  recomputeInheritedProperties(req.params.id);
  res.status(201).json({ added: true });
});

// Remove a member from a G node
router.delete('/:id/members/:memberId', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`DELETE FROM group_members WHERE group_id = ? AND member_id = ?`)
    .run(req.params.id, req.params.memberId);
  recomputeInheritedProperties(req.params.id);
  res.json({ removed: true });
});

// Expand: get full subgraph data for a G node (recursive — includes nested G members)
router.get('/:id/expand', (req: Request, res: Response) => {
  const db = getDb();
  const group = db.prepare(`SELECT * FROM nodes WHERE id = ? `).get(req.params.id);

  if (!group) {
    res.status(404).json({ error: 'G 节点不存在' });
    return;
  }

  // Collect all member IDs (use the existing members)
  const rows = db.prepare(`
    SELECT member_id FROM group_members WHERE group_id = ?
  `).all(req.params.id) as { member_id: string }[];

  const memberIds = rows.map((r) => r.member_id);

  let allMembers: any[] = [];
  let allEdges: any[] = [];
  const seen = new Set<string>();

  function collect(nodeIds: string[]) {
    if (nodeIds.length === 0) return;
    const placeholders = nodeIds.map(() => '?').join(',');
    const nodes = db.prepare(`
      SELECT * FROM nodes WHERE id IN (${placeholders})
    `).all(...nodeIds);
    for (const n of nodes) {
      if (seen.has((n as any).id)) continue;
      seen.add((n as any).id);
      allMembers.push(n);
      // If this member is itself a G, recurse
      if ((n as any).type === 'Statement' || (n as any).type === 'Entity' || (n as any).type === 'Scope') {
        const subMembers = db.prepare(
          `SELECT member_id FROM group_members WHERE group_id = ?`
        ).all((n as any).id) as { member_id: string }[];
        collect(subMembers.map((r) => r.member_id));
      }
    }
    // Internal edges
    if (nodeIds.length >= 2) {
      const p = nodeIds.map(() => '?').join(',');
      const edges = db.prepare(`
        SELECT e.*,
          sn.label as source_label, sn.type as source_type,
          tn.label as target_label, tn.type as target_type
        FROM edges e
        JOIN nodes sn ON e.source_id = sn.id
        JOIN nodes tn ON e.target_id = tn.id
        WHERE e.source_id IN (${p}) AND e.target_id IN (${p})
      `).all(...nodeIds, ...nodeIds);
      allEdges.push(...edges);
    }
  }

  collect(memberIds);

  // External edges: edges where one endpoint is a member and the other is NOT in the group
  const allSeen = new Set([req.params.id, ...Array.from(seen)]);
  const externalEdges = db.prepare(`
    SELECT e.*,
      sn.label as source_label, sn.type as source_type,
      tn.label as target_label, tn.type as target_type
    FROM edges e
    JOIN nodes sn ON e.source_id = sn.id
    JOIN nodes tn ON e.target_id = tn.id
    WHERE (
      (e.source_id IN (${memberIds.map(() => '?').join(',')}) AND e.target_id NOT IN (${memberIds.map(() => '?').join(',')}))
      OR
      (e.target_id IN (${memberIds.map(() => '?').join(',')}) AND e.source_id NOT IN (${memberIds.map(() => '?').join(',')}))
    )
  `).all(...memberIds, ...memberIds, ...memberIds, ...memberIds);

  res.json({ group, members: allMembers, internalEdges: allEdges, externalEdges });
});

// Delete a G node (optionally keep members, default: keep)
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { keepMembers = 'true' } = req.query;

  const group = db.prepare(`SELECT * FROM nodes WHERE id = ? `).get(req.params.id);
  if (!group) {
    res.status(404).json({ error: 'G 节点不存在' });
    return;
  }

  if (keepMembers === 'true') {
    // Just remove the G node, members stay
    db.prepare(`DELETE FROM group_members WHERE group_id = ?`).run(req.params.id);
    db.prepare(`DELETE FROM nodes WHERE id = ?`).run(req.params.id);
  } else {
    // Cascade delete members too — but edges referencing members would break
    // For safety, only delete the G node and its group_members, keep member nodes
    db.prepare(`DELETE FROM group_members WHERE group_id = ?`).run(req.params.id);
    db.prepare(`DELETE FROM nodes WHERE id = ?`).run(req.params.id);
  }

  res.json({ deleted: true });
});

// Helper: recompute inherited properties as intersection of member properties
function recomputeInheritedProperties(groupId: string): void {
  const db = getDb();
  const members = db.prepare(
    `SELECT member_id FROM group_members WHERE group_id = ?`
  ).all(groupId) as { member_id: string }[];

  if (members.length === 0) return;

  const memberIds = members.map((m) => m.member_id);
  const placeholders = memberIds.map(() => '?').join(',');

  // Intersection: properties that ALL members share
  const shared = db.prepare(`
    SELECT np.property_id
    FROM node_properties np
    WHERE np.node_id IN (${placeholders})
    GROUP BY np.property_id
    HAVING COUNT(DISTINCT np.node_id) = ?
  `).all(...memberIds, memberIds.length) as { property_id: string }[];

  // Replace all inherited properties
  db.prepare(`DELETE FROM node_properties WHERE node_id = ?`).run(groupId);
  const insert = db.prepare(
    `INSERT OR IGNORE INTO node_properties (node_id, property_id) VALUES (?, ?)`
  );
  for (const { property_id } of shared) {
    insert.run(groupId, property_id);
  }
}

export default router;
