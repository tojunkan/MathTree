import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// Full-text search across nodes
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { q } = req.query;

  if (!q || !(q as string).trim()) {
    res.json([]);
    return;
  }

  const query = (q as string).trim();

  // Use FTS5 for full-text search
  let results: any[];
  try {
    results = db.prepare(`
      SELECT n.*,
        rank as score
      FROM nodes_fts f
      JOIN nodes n ON f.rowid = n.rowid
      WHERE nodes_fts MATCH ?
      ORDER BY rank
      LIMIT 20
    `).all(`"${query}"`);
  } catch {
    // Fallback to LIKE search if FTS query is invalid
    results = db.prepare(`
      SELECT *, 0 as score FROM nodes
      WHERE label LIKE ? OR description LIKE ?
      LIMIT 20
    `).all(`%${query}%`, `%${query}%`);
  }

  res.json(results);
});

// Search by property: find all edges/nodes using a given property name
router.get('/property/:name', (req: Request, res: Response) => {
  const db = getDb();
  const name = req.params.name;

  const edges = db.prepare(`
    SELECT e.*,
      sn.label as source_label, sn.type as source_type,
      tn.label as target_label, tn.type as target_type
    FROM edges e
    JOIN nodes sn ON e.source_id = sn.id
    JOIN nodes tn ON e.target_id = tn.id
    WHERE e.label LIKE ?
  `).all(`%${name}%`);

  res.json(edges);
});

// Search by math idea: find all nodes tagged with a given idea
router.get('/math-idea/:name', (req: Request, res: Response) => {
  const db = getDb();
  const name = req.params.name;

  const nodes = db.prepare(`
    SELECT n.* FROM nodes n
    JOIN node_math_ideas nmi ON n.id = nmi.node_id
    JOIN math_ideas mi ON nmi.idea_id = mi.id
    WHERE mi.name LIKE ?
  `).all(`%${name}%`);

  res.json(nodes);
});

export default router;
