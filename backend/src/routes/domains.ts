import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// List all domains (flat list with parent info)
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const domains = db.prepare(`
    SELECT d.*,
      COUNT(nd.node_id) as node_count
    FROM domains d
    LEFT JOIN node_domains nd ON d.id = nd.domain_id
    GROUP BY d.id
    ORDER BY d.name
  `).all();
  res.json(domains);
});

// Create domain
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { name, parentId = null, color = '#6366f1' } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name 不能为空' });
    return;
  }

  const id = uuid();
  db.prepare(`INSERT INTO domains (id, name, parent_id, color) VALUES (?, ?, ?, ?)`)
    .run(id, name.trim(), parentId, color);

  const domain = db.prepare(`SELECT * FROM domains WHERE id = ?`).get(id);
  res.status(201).json(domain);
});

// Update domain
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const domain = db.prepare(`SELECT * FROM domains WHERE id = ?`).get(req.params.id);

  if (!domain) {
    res.status(404).json({ error: '域不存在' });
    return;
  }

  const d = domain as any;
  const { name, parentId, color } = req.body;

  db.prepare(`UPDATE domains SET name = ?, parent_id = ?, color = ? WHERE id = ?`)
    .run(
      name !== undefined ? name.trim() : d.name,
      parentId !== undefined ? parentId : d.parent_id,
      color !== undefined ? color : d.color,
      req.params.id
    );

  const updated = db.prepare(`SELECT * FROM domains WHERE id = ?`).get(req.params.id);
  res.json(updated);
});

// Delete domain
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();

  // Move children to grandparent
  const domain = db.prepare(`SELECT parent_id FROM domains WHERE id = ?`).get(req.params.id) as any;
  if (domain) {
    db.prepare(`UPDATE domains SET parent_id = ? WHERE parent_id = ?`)
      .run(domain.parent_id, req.params.id);
  }

  db.prepare(`DELETE FROM domains WHERE id = ?`).run(req.params.id);
  res.json({ deleted: true });
});

// Add a node to a domain
router.post('/:domainId/nodes/:nodeId', (req: Request, res: Response) => {
  const db = getDb();

  try {
    db.prepare(`INSERT INTO node_domains (node_id, domain_id) VALUES (?, ?)`)
      .run(req.params.nodeId, req.params.domainId);
  } catch {
    // Already exists — ignore
  }

  res.status(201).json({ added: true });
});

// Remove a node from a domain
router.delete('/:domainId/nodes/:nodeId', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`DELETE FROM node_domains WHERE node_id = ? AND domain_id = ?`)
    .run(req.params.nodeId, req.params.domainId);
  res.json({ removed: true });
});

export default router;
