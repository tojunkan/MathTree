import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';
import { ensurePrimaryProof } from '../lib/validators.js';
import { clearDepthCache, selectPrimaryProof } from '../lib/layout.js';

const router = Router();

// List proofs for a theorem
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { theorem_id } = req.query;

  if (!theorem_id) {
    res.status(400).json({ error: 'theorem_id 参数必填' });
    return;
  }

  const proofs = db.prepare(`
    SELECT * FROM proofs WHERE theorem_id = ? ORDER BY is_primary DESC, created_at ASC
  `).all(theorem_id);

  res.json(proofs);
});

// Create a proof
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { theoremId, title = '新证明', content = '' } = req.body;

  if (!theoremId) {
    res.status(400).json({ error: 'theoremId 不能为空' });
    return;
  }

  const theorem = db.prepare(`SELECT * FROM nodes WHERE id = ? AND type = 'Statement'`).get(theoremId);
  if (!theorem) {
    res.status(400).json({ error: '定理节点不存在' });
    return;
  }

  const id = uuid();

  // Check if this is the first proof — make it primary
  const existingCount = db.prepare(
    `SELECT COUNT(*) as count FROM proofs WHERE theorem_id = ?`
  ).get(theoremId) as { count: number };
  const isPrimary = existingCount.count === 0 ? 1 : 0;

  db.prepare(`
    INSERT INTO proofs (id, theorem_id, title, content, is_primary)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, theoremId, title, content, isPrimary);

  const proof = db.prepare(`SELECT * FROM proofs WHERE id = ?`).get(id);
  res.status(201).json(proof);
});

// Update a proof
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const proof = db.prepare(`SELECT * FROM proofs WHERE id = ?`).get(req.params.id);

  if (!proof) {
    res.status(404).json({ error: '证明不存在' });
    return;
  }

  const { title, content, isPrimary } = req.body;
  const p = proof as any;

  const newTitle = title !== undefined ? title : p.title;
  const newContent = content !== undefined ? content : p.content;

  db.prepare(`
    UPDATE proofs SET title = ?, content = ? WHERE id = ?
  `).run(newTitle, newContent, req.params.id);

  // Handle primary proof setting
  if (isPrimary === true) {
    db.prepare(`UPDATE proofs SET is_primary = 0 WHERE theorem_id = ?`).run(p.theorem_id);
    db.prepare(`UPDATE proofs SET is_primary = 1 WHERE id = ?`).run(req.params.id);
  } else if (isPrimary === false && p.is_primary) {
    // Unsetting primary — pick another
    db.prepare(`UPDATE proofs SET is_primary = 0 WHERE id = ?`).run(req.params.id);
    ensurePrimaryProof(p.theorem_id);
  }

  const updated = db.prepare(`SELECT * FROM proofs WHERE id = ?`).get(req.params.id);
  res.json(updated);
});

// Delete a proof
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const proof = db.prepare(`SELECT * FROM proofs WHERE id = ?`).get(req.params.id);

  if (!proof) {
    res.status(404).json({ error: '证明不存在' });
    return;
  }

  const p = proof as any;
  db.prepare(`DELETE FROM proofs WHERE id = ?`).run(req.params.id);

  // If deleted proof was primary, pick a new one
  if (p.is_primary) {
    ensurePrimaryProof(p.theorem_id);
  }

  // Recompute primary proof based on depth
  clearDepthCache();
  selectPrimaryProof(p.theorem_id);

  res.json({ deleted: true });
});

export default router;
