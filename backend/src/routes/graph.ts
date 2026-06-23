import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

// Export entire graph as JSON
router.get('/export', (_req: Request, res: Response) => {
  const db = getDb();

  const nodes = db.prepare(`SELECT * FROM nodes`).all();
  const edges = db.prepare(`SELECT * FROM edges`).all();
  const proofs = db.prepare(`SELECT * FROM proofs`).all();
  const properties = db.prepare(`SELECT * FROM properties`).all();
  const nodeProperties = db.prepare(`SELECT * FROM node_properties`).all();
  const domains = db.prepare(`SELECT * FROM domains`).all();
  const nodeDomains = db.prepare(`SELECT * FROM node_domains`).all();
  const mathIdeas = db.prepare(`SELECT * FROM math_ideas`).all();
  const nodeMathIdeas = db.prepare(`SELECT * FROM node_math_ideas`).all();

  res.json({
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      nodes,
      edges,
      proofs,
      properties,
      nodeProperties,
      domains,
      nodeDomains,
      mathIdeas,
      nodeMathIdeas,
    },
  });
});

// Import entire graph from JSON
router.post('/import', (req: Request, res: Response) => {
  const db = getDb();
  const { data } = req.body;

  if (!data) {
    res.status(400).json({ error: '缺少 data 字段' });
    return;
  }

  const importAll = db.transaction(() => {
    const counts: Record<string, number> = {};

    // Import in dependency order
    if (data.domains) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO domains (id, name, parent_id, color) VALUES (?, ?, ?, ?)`);
      for (const d of data.domains) {
        stmt.run(d.id, d.name, d.parent_id || null, d.color || '#6366f1');
        counts.domains = (counts.domains || 0) + 1;
      }
    }

    if (data.properties) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO properties (id, name, description) VALUES (?, ?, ?)`);
      for (const p of data.properties) {
        stmt.run(p.id, p.name, p.description || '');
        counts.properties = (counts.properties || 0) + 1;
      }
    }

    if (data.nodes) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO nodes (id, type, label, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const n of data.nodes) {
        stmt.run(n.id, n.type, n.label, n.description || '', n.created_at || new Date().toISOString(), n.updated_at || new Date().toISOString());
        counts.nodes = (counts.nodes || 0) + 1;
      }
    }

    if (data.proofs) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO proofs (id, theorem_id, title, content, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const p of data.proofs) {
        stmt.run(p.id, p.theorem_id, p.title, p.content || '', p.is_primary || 0, p.created_at || new Date().toISOString());
        counts.proofs = (counts.proofs || 0) + 1;
      }
    }

    if (data.edges) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO edges (id, source_id, target_id, label, proof_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      for (const e of data.edges) {
        stmt.run(e.id, e.source_id, e.target_id, e.label, e.proof_id || null, e.description || '', e.created_at || new Date().toISOString());
        counts.edges = (counts.edges || 0) + 1;
      }
    }

    if (data.nodeProperties) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO node_properties (node_id, property_id) VALUES (?, ?)`);
      for (const np of data.nodeProperties) {
        stmt.run(np.node_id, np.property_id);
        counts.nodeProperties = (counts.nodeProperties || 0) + 1;
      }
    }

    if (data.nodeDomains) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO node_domains (node_id, domain_id) VALUES (?, ?)`);
      for (const nd of data.nodeDomains) {
        stmt.run(nd.node_id, nd.domain_id);
        counts.nodeDomains = (counts.nodeDomains || 0) + 1;
      }
    }

    if (data.mathIdeas) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO math_ideas (id, name, description) VALUES (?, ?, ?)`);
      for (const mi of data.mathIdeas) {
        stmt.run(mi.id, mi.name, mi.description || '');
        counts.mathIdeas = (counts.mathIdeas || 0) + 1;
      }
    }

    if (data.nodeMathIdeas) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO node_math_ideas (node_id, idea_id) VALUES (?, ?)`);
      for (const nmi of data.nodeMathIdeas) {
        stmt.run(nmi.node_id, nmi.idea_id);
        counts.nodeMathIdeas = (counts.nodeMathIdeas || 0) + 1;
      }
    }

    return counts;
  });

  const counts = importAll();
  res.json({ imported: true, counts });
});

export default router;
