// === Node Types ===
export type NodeType = 'Entity' | 'Statement' | 'Scope' | 'Reference' | 'Idea';

export type EntitySubtype = 'object' | 'operation' | 'relation' | 'property' | 'variable' | 'quantifier';
export type StatementSubtype = 'definition' | 'axiom' | 'theorem' | 'lemma' | 'corollary'
  | 'assumption' | 'conjecture' | 'counterexample_claim' | 'condition'
  | 'question' | 'relation_application' | 'operation_application';
export type ScopeKind = 'reductio' | 'cases' | 'conditional' | 'let_bind';
export type TruthValue = 'true' | 'false' | 'unknown' | 'conditional';

export const ENTITY_SUBTYPES: EntitySubtype[] = ['object', 'operation', 'relation', 'property', 'variable', 'quantifier'];
export const STATEMENT_SUBTYPES: StatementSubtype[] = ['definition', 'axiom', 'theorem', 'lemma', 'corollary', 'assumption', 'conjecture', 'counterexample_claim', 'condition', 'question', 'relation_application', 'operation_application'];
export const SCOPE_KINDS: ScopeKind[] = ['reductio', 'cases', 'conditional', 'let_bind'];

export const SUBTYPE_MAP: Record<NodeType, string[]> = {
  Entity: ENTITY_SUBTYPES,
  Statement: STATEMENT_SUBTYPES,
  Scope: SCOPE_KINDS,
  Reference: [],
  Idea: [],
};

export const SUBTYPE_LABELS: Record<string, string> = {
  object: '数学对象', operation: '运算/映射', relation: '关系', property: '性质/属性', variable: '变量', quantifier: '量词',
  definition: '定义', axiom: '公理', theorem: '定理', lemma: '引理', corollary: '推论',
  assumption: '假设', conjecture: '猜想', counterexample_claim: '反例断言', condition: '条件分叉',
  question: '开放问题', relation_application: '关系判定实例', operation_application: '运算应用实例',
  reductio: '反证法', cases: '分情况证明', conditional: '条件假设', let_bind: '变量赋值',
};

// === Node Row ===
export interface NodeRow {
  id: string;
  type: NodeType;
  subtype: string;
  label: string;
  description: string;
  truth_value: TruthValue | null;
  truth_context: string | null;
  scope_kind: ScopeKind | null;
  is_exhaustive: number;
  refers_to: string | null;
  created_at: string;
  updated_at: string;
}

// === Enriched Node ===
export interface PropertyRow { id: string; name: string; description: string; }
export interface ProofRow { id: string; theorem_id: string; title: string; content: string; is_primary: number; created_at: string; }
export interface DomainRow { id: string; name: string; parent_id: string | null; color: string; node_count?: number; }
export interface MathIdeaRow { id: string; name: string; description: string; node_count?: number; }
export interface GroupMember extends NodeRow { sort_order: number; }

export interface INode extends NodeRow {
  properties: PropertyRow[];
  proofs: ProofRow[];
  domains: DomainRow[];
  mathIdeas: MathIdeaRow[];
  groupMembers?: GroupMember[];
  parentGroups?: NodeRow[];
}

// === Edge Types ===
export type EdgeCategory = 'construction' | 'logic' | 'bind' | 'case';
export type ConstructionEdgeType = 'is_a' | 'instance_of' | 'compose' | 'has_property' | 'define'
  | 'arg_1' | 'arg_2' | 'arg_3' | 'arg_4' | 'uses_template' | 'result' | 'substitute' | 'depend_on';
export type LogicEdgeType = 'implies' | 'equivalent' | 'special_case' | 'counterexample_of' | 'uses_idea';
export type BindEdgeType = 'bind';
export type CaseEdgeType = 'case';
export type EdgeType = ConstructionEdgeType | LogicEdgeType | BindEdgeType | CaseEdgeType;

export const CONSTRUCTION_EDGE_TYPES: ConstructionEdgeType[] = ['is_a', 'instance_of', 'compose', 'has_property', 'define', 'arg_1', 'arg_2', 'arg_3', 'arg_4', 'uses_template', 'result', 'substitute', 'depend_on'];
export const LOGIC_EDGE_TYPES: LogicEdgeType[] = ['implies', 'equivalent', 'special_case', 'counterexample_of', 'uses_idea'];
export const EDGE_TYPES_BY_CATEGORY: Record<EdgeCategory, EdgeType[]> = {
  construction: CONSTRUCTION_EDGE_TYPES,
  logic: LOGIC_EDGE_TYPES,
  bind: ['bind'],
  case: ['case'],
};

export interface EdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  category: EdgeCategory;
  edge_type: EdgeType;
  label: string | null;
  description: string;
  truth_value: TruthValue | null;
  truth_context: string | null;
  scope_id: string | null;
  proof_id: string | null;
  derived_by_scope_exit: number;
  created_at: string;
}

export interface IEdge extends EdgeRow {
  source_label?: string;
  source_type?: NodeType;
  target_label?: string;
  target_type?: NodeType;
}

// === Layout / View ===
export type LayoutType = 'dagre' | 'cose' | 'breadthfirst' | 'circle';
export type ViewMode = 'graph' | 'list' | 'domain';

export interface FilterState {
  nodeTypes: NodeType[];
  domainIds: string[];
  mathIdeaIds: string[];
  searchQuery: string;
}

export interface NeighborInfo { incoming: IEdge[]; outgoing: IEdge[]; }
