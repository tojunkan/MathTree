-- MathTree v2 Schema: Entity / Statement / Scope / Reference / Idea

-- ============ Nodes ============
CREATE TABLE IF NOT EXISTS nodes (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK(type IN ('Entity','Statement','Scope','Reference','Idea')),
  subtype       TEXT NOT NULL DEFAULT '',
  label         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  -- Statement / Scope fields
  truth_value   TEXT,           -- 'true','false','unknown','conditional'
  truth_context TEXT,           -- → nodes(id), nearest dependent Scope
  -- Scope only
  scope_kind    TEXT,           -- 'reductio','cases','conditional','let_bind'
  -- Statement/Condition only
  is_exhaustive INTEGER DEFAULT 0,
  -- Reference only
  refers_to     TEXT,           -- → nodes(id), target of the symbolic link
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============ Edges ============
CREATE TABLE IF NOT EXISTS edges (
  id          TEXT PRIMARY KEY,
  source_id   TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK(category IN ('construction','logic','bind','case')),
  edge_type   TEXT NOT NULL,
  -- construction: is_a, instance_of, compose, has_property, define,
  --               arg_1..arg_n, uses_template, result, substitute, depend_on
  -- logic:       implies, equivalent, special_case, counterexample_of, uses_idea
  -- bind:        bind
  -- case:        case
  label       TEXT,
  description TEXT NOT NULL DEFAULT '',
  truth_value TEXT,           -- only for logic / bind edges
  truth_context TEXT,
  scope_id    TEXT,
  proof_id    TEXT REFERENCES proofs(id) ON DELETE SET NULL,
  derived_by_scope_exit INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============ Groups (all nodes can expand) ============
CREATE TABLE IF NOT EXISTS group_members (
  group_id   TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  member_id  TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (group_id, member_id)
);

-- ============ Global Properties Pool ============
CREATE TABLE IF NOT EXISTS properties (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS node_properties (
  node_id     TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, property_id)
);

-- ============ Proofs ============
CREATE TABLE IF NOT EXISTS proofs (
  id          TEXT PRIMARY KEY,
  theorem_id  TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '默认证明',
  content     TEXT NOT NULL DEFAULT '',
  is_primary  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============ Domains ============
CREATE TABLE IF NOT EXISTS domains (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  parent_id TEXT REFERENCES domains(id) ON DELETE SET NULL,
  color     TEXT NOT NULL DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS node_domains (
  node_id   TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, domain_id)
);

-- ============ Math Ideas ============
CREATE TABLE IF NOT EXISTS math_ideas (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS node_math_ideas (
  node_id   TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  idea_id   TEXT NOT NULL REFERENCES math_ideas(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, idea_id)
);

-- ============ Full-text Search ============
CREATE VIRTUAL TABLE IF NOT EXISTS nodes_fts USING fts5(
  label,
  description,
  content='nodes',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS nodes_fts_insert AFTER INSERT ON nodes BEGIN
  INSERT INTO nodes_fts(rowid, label, description) VALUES (new.rowid, new.label, new.description);
END;

CREATE TRIGGER IF NOT EXISTS nodes_fts_delete AFTER DELETE ON nodes BEGIN
  INSERT INTO nodes_fts(nodes_fts, rowid, label, description) VALUES ('delete', old.rowid, old.label, old.description);
END;

CREATE TRIGGER IF NOT EXISTS nodes_fts_update AFTER UPDATE ON nodes BEGIN
  INSERT INTO nodes_fts(nodes_fts, rowid, label, description) VALUES ('delete', old.rowid, old.label, old.description);
  INSERT INTO nodes_fts(rowid, label, description) VALUES (new.rowid, new.label, new.description);
END;
