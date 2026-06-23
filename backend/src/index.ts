import express from 'express';
import cors from 'cors';
import { getDb, closeDb } from './db/database.js';

import nodesRouter from './routes/nodes.js';
import edgesRouter from './routes/edges.js';
import proofsRouter from './routes/proofs.js';
import propertiesRouter from './routes/properties.js';
import domainsRouter from './routes/domains.js';
import mathIdeasRouter from './routes/mathIdeas.js';
import groupsRouter from './routes/groups.js';
import searchRouter from './routes/search.js';
import graphRouter from './routes/graph.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
getDb();

// API routes
app.use('/api/nodes', nodesRouter);
app.use('/api/edges', edgesRouter);
app.use('/api/proofs', proofsRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/math-ideas', mathIdeasRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/search', searchRouter);
app.use('/api/graph', graphRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: '../frontend/dist' });
  });
}

app.listen(PORT, () => {
  console.log(`MathTree backend running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
