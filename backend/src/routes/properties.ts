import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = Router();

// List all properties
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const properties = db.prepare(`SELECT * FROM properties ORDER BY name`).all();
  res.json(properties);
});

// Create a property
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { name, description = '' } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'name 不能为空' });
    return;
  }

  const id = uuid();
  try {
    db.prepare(`INSERT INTO properties (id, name, description) VALUES (?, ?, ?)`)
      .run(id, name.trim(), description);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      res.status(409).json({ error: '该性质已存在' });
      return;
    }
    throw e;
  }

  const prop = db.prepare(`SELECT * FROM properties WHERE id = ?`).get(id);
  res.status(201).json(prop);
});

export default router;
