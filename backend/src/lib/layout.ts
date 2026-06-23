import { getDb } from '../db/database.js';

/**
 * Compute the "depth" of a node — the length of the longest incoming path
 * from any root I node (a node with no incoming edges).
 *
 * Uses BFS with memoization. A node's depth = 1 + max(depth of incoming sources).
 * Root I nodes have depth 0.
 */
const depthCache = new Map<string, number>();

export function computeDepth(nodeId: string, visited = new Set<string>()): number {
  if (depthCache.has(nodeId)) {
    return depthCache.get(nodeId)!;
  }
  if (visited.has(nodeId)) {
    // Cycle detected; break it by returning current visited size as depth
    return visited.size;
  }

  const db = getDb();
  visited.add(nodeId);

  const incoming = db.prepare(`
    SELECT source_id FROM edges WHERE target_id = ?
  `).all(nodeId) as { source_id: string }[];

  if (incoming.length === 0) {
    depthCache.set(nodeId, 0);
    return 0;
  }

  let maxDepth = 0;
  for (const { source_id } of incoming) {
    const d = computeDepth(source_id, new Set(visited));
    if (d + 1 > maxDepth) {
      maxDepth = d + 1;
    }
  }

  depthCache.set(nodeId, maxDepth);
  return maxDepth;
}

export function clearDepthCache(): void {
  depthCache.clear();
}

/**
 * Select the "shallowest" proof as primary for a theorem node.
 * Shallow = smallest total depth of incoming source nodes.
 */
export function selectPrimaryProof(theoremId: string): void {
  const db = getDb();
  clearDepthCache();

  const proofs = db.prepare(`
    SELECT id FROM proofs WHERE theorem_id = ?
  `).all(theoremId) as { id: string }[];

  if (proofs.length === 0) return;

  let bestProofId = proofs[0].id;
  let bestDepth = Infinity;

  for (const { id } of proofs) {
    const edges = db.prepare(`
      SELECT source_id FROM edges WHERE proof_id = ?
    `).all(id) as { source_id: string }[];

    let totalDepth = 0;
    for (const { source_id } of edges) {
      totalDepth = Math.max(totalDepth, computeDepth(source_id) + 1);
    }

    if (totalDepth < bestDepth) {
      bestDepth = totalDepth;
      bestProofId = id;
    }
  }

  db.prepare(`UPDATE proofs SET is_primary = 0 WHERE theorem_id = ?`).run(theoremId);
  db.prepare(`UPDATE proofs SET is_primary = 1 WHERE id = ?`).run(bestProofId);
}
