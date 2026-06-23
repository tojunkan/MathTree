import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// List all math ideas
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const ideas = db.prepare(`
    SELECT mi.*,
      COUNT(nmi.node_id) as node_count
    FROM math_ideas mi
    LEFT JOIN node_math_ideas nmi ON mi.id = nmi.idea_id
    GROUP BY mi.id
    ORDER BY mi.name
  `).all();
  res.json(ideas);
});

// Create a math idea
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { name, description = '' } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name 不能为空' });
    return;
  }

  const id = uuid();
  try {
    db.prepare(`INSERT INTO math_ideas (id, name, description) VALUES (?, ?, ?)`)
      .run(id, name.trim(), description);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(409).json({ error: '该数学思想标签已存在' });
      return;
    }
    throw e;
  }

  const idea = db.prepare(`SELECT * FROM math_ideas WHERE id = ?`).get(id);
  res.status(201).json(idea);
});

// Delete math idea
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`DELETE FROM math_ideas WHERE id = ?`).run(req.params.id);
  res.json({ deleted: true });
});

// Add a math idea to a node
router.post('/:ideaId/nodes/:nodeId', (req: Request, res: Response) => {
  const db = getDb();

  try {
    db.prepare(`INSERT INTO node_math_ideas (node_id, idea_id) VALUES (?, ?)`)
      .run(req.params.nodeId, req.params.ideaId);
  } catch {
    // Already exists — ignore
  }

  res.status(201).json({ added: true });
});

// Remove a math idea from a node
router.delete('/:ideaId/nodes/:nodeId', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`DELETE FROM node_math_ideas WHERE node_id = ? AND idea_id = ?`)
    .run(req.params.nodeId, req.params.ideaId);
  res.json({ removed: true });
});

export default router;
