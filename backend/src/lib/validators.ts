import { getDb } from '../db/database.js';

/**
 * Validate that a property label exists in the source node's property table.
 */
export function validatePropertyInSource(
  sourceId: string,
  label: string
): { valid: true } | { valid: false; error: string } {
  const db = getDb();
  const row = db.prepare(`
    SELECT 1 FROM node_properties np
    JOIN properties p ON np.property_id = p.id
    WHERE np.node_id = ? AND p.name = ?
  `).get(sourceId, label);

  if (!row) {
    return {
      valid: false,
      error: `性质 "${label}" 不在源节点的性质表中，请先将该性质添加到源节点`,
    };
  }
  return { valid: true };
}

/**
 * Check whether deleting a node would leave dependent nodes dangling.
 * Returns a list of dependent T nodes.
 */
export function checkCascadeDelete(nodeId: string): { canDelete: boolean; dependents: { id: string; label: string }[] } {
  const db = getDb();
  const dependents = db.prepare(`
    SELECT DISTINCT n.id, n.label
    FROM edges e
    JOIN nodes n ON e.target_id = n.id
    WHERE e.source_id = ? AND n.type = 'T'
  `).all(nodeId) as { id: string; label: string }[];

  return {
    canDelete: dependents.length === 0,
    dependents,
  };
}

/**
 * Ensure a T node has exactly one primary proof.
 */
export function ensurePrimaryProof(theoremId: string): void {
  const db = getDb();
  const primary = db.prepare(
    `SELECT id FROM proofs WHERE theorem_id = ? AND is_primary = 1`
  ).get(theoremId);

  if (!primary) {
    // Set the first proof as primary
    const first = db.prepare(
      `SELECT id FROM proofs WHERE theorem_id = ? ORDER BY created_at ASC LIMIT 1`
    ).get(theoremId) as { id: string } | undefined;

    if (first) {
      db.prepare(`UPDATE proofs SET is_primary = 1 WHERE id = ?`).run(first.id);
    }
  }
}

/**
 * Validate that a source_id / target_id pair doesn't form a self-loop.
 */
export function validateNoSelfLoop(
  sourceId: string,
  targetId: string
): { valid: true } | { valid: false; error: string } {
  if (sourceId === targetId) {
    return { valid: false, error: '不允许自环（source 和 target 不能相同）' };
  }
  return { valid: true };
}
