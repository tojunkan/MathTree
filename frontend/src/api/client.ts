import type {
  NodeRow,
  INode,
  EdgeRow,
  IEdge,
  ProofRow,
  PropertyRow,
  DomainRow,
  MathIdeaRow,
  NeighborInfo,
} from '../types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `HTTP ${res.status}`);
  }
  return res.json();
}

// === Nodes ===
export const nodesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<NodeRow[]>(`/nodes${qs}`);
  },
  get: (id: string) => request<INode>(`/nodes/${id}`),
  create: (data: { type: string; label: string; description?: string }) =>
    request<NodeRow>('/nodes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { label?: string; description?: string }) =>
    request<NodeRow>(`/nodes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string, force = false) =>
    request<{ deleted: boolean }>(`/nodes/${id}?force=${force}`, { method: 'DELETE' }),
  addProperty: (nodeId: string, propertyId: string) =>
    request<{ added: boolean }>(`/nodes/${nodeId}/properties`, {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    }),
  removeProperty: (nodeId: string, propertyId: string) =>
    request<{ removed: boolean }>(`/nodes/${nodeId}/properties/${propertyId}`, { method: 'DELETE' }),
  neighbors: (id: string, depth = 1) =>
    request<NeighborInfo>(`/nodes/${id}/neighbors?depth=${depth}`),
};

// === Edges ===
export const edgesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<IEdge[]>(`/edges${qs}`);
  },
  create: (data: {
    sourceId: string;
    targetId: string;
    label: string;
    proofId?: string | null;
    description?: string;
  }) => request<EdgeRow>('/edges', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ deleted: boolean }>(`/edges/${id}`, { method: 'DELETE' }),
};

// === Proofs ===
export const proofsApi = {
  list: (theoremId: string) => request<ProofRow[]>(`/proofs?theorem_id=${theoremId}`),
  create: (data: { theoremId: string; title?: string; content?: string }) =>
    request<ProofRow>('/proofs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { title?: string; content?: string; isPrimary?: boolean }) =>
    request<ProofRow>(`/proofs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ deleted: boolean }>(`/proofs/${id}`, { method: 'DELETE' }),
};

// === Properties ===
export const propertiesApi = {
  list: () => request<PropertyRow[]>('/properties'),
  create: (data: { name: string; description?: string }) =>
    request<PropertyRow>('/properties', { method: 'POST', body: JSON.stringify(data) }),
};

// === Domains ===
export const domainsApi = {
  list: () => request<DomainRow[]>('/domains'),
  create: (data: { name: string; parentId?: string | null; color?: string }) =>
    request<DomainRow>('/domains', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; parentId?: string | null; color?: string }) =>
    request<DomainRow>(`/domains/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ deleted: boolean }>(`/domains/${id}`, { method: 'DELETE' }),
  addNode: (domainId: string, nodeId: string) =>
    request<{ added: boolean }>(`/domains/${domainId}/nodes/${nodeId}`, { method: 'POST' }),
  removeNode: (domainId: string, nodeId: string) =>
    request<{ removed: boolean }>(`/domains/${domainId}/nodes/${nodeId}`, { method: 'DELETE' }),
};

// === Math Ideas ===
export const mathIdeasApi = {
  list: () => request<MathIdeaRow[]>('/math-ideas'),
  create: (data: { name: string; description?: string }) =>
    request<MathIdeaRow>('/math-ideas', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ deleted: boolean }>(`/math-ideas/${id}`, { method: 'DELETE' }),
  addNode: (ideaId: string, nodeId: string) =>
    request<{ added: boolean }>(`/math-ideas/${ideaId}/nodes/${nodeId}`, { method: 'POST' }),
  removeNode: (ideaId: string, nodeId: string) =>
    request<{ removed: boolean }>(`/math-ideas/${ideaId}/nodes/${nodeId}`, { method: 'DELETE' }),
};

// === Search ===
export const searchApi = {
  search: (q: string) => request<NodeRow[]>(`/search?q=${encodeURIComponent(q)}`),
  byProperty: (name: string) => request<IEdge[]>(`/search/property/${encodeURIComponent(name)}`),
  byMathIdea: (name: string) => request<NodeRow[]>(`/search/math-idea/${encodeURIComponent(name)}`),
};

// === Groups (virtual nodes) ===
export const groupsApi = {
  create: (data: { label: string; description?: string; memberIds: string[] }) =>
    request<any>('/groups', { method: 'POST', body: JSON.stringify(data) }),
  getAllMemberships: () =>
    request<{ group_id: string; member_id: string }[]>('/groups/memberships'),
  getMembers: (id: string) => request<any>(`/groups/${id}/members`),
  expand: (id: string) => request<any>(`/groups/${id}/expand`),
  addMember: (groupId: string, memberId: string) =>
    request<{ added: boolean }>(`/groups/${groupId}/members`, {
      method: 'POST', body: JSON.stringify({ memberId }),
    }),
  removeMember: (groupId: string, memberId: string) =>
    request<{ removed: boolean }>(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' }),
  delete: (id: string, keepMembers = true) =>
    request<{ deleted: boolean }>(`/groups/${id}?keepMembers=${keepMembers}`, { method: 'DELETE' }),
};

// === Graph (export/import) — to be rewritten for v2 ===
