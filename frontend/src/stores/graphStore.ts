import { create } from 'zustand';
import type {
  NodeRow,
  INode,
  IEdge,
  ProofRow,
  PropertyRow,
  DomainRow,
  MathIdeaRow,
  NodeType,
  LayoutType,
  ViewMode,
  FilterState,
  NeighborInfo,
} from '../types';
import { nodesApi, edgesApi, proofsApi, propertiesApi, domainsApi, mathIdeasApi, searchApi, groupsApi } from '../api/client';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface GraphStore {
  // Data
  nodes: NodeRow[];
  edges: IEdge[];
  domains: DomainRow[];
  mathIdeas: MathIdeaRow[];
  properties: PropertyRow[];

  // Loading
  loading: boolean;
  error: string | null;

  // Selection
  selectedNode: INode | null;
  selectedEdge: IEdge | null;
  hoveredNodeId: string | null;
  neighbors: NeighborInfo | null;

  // View
  viewMode: ViewMode;
  layout: LayoutType;
  showLabels: boolean;
  collapseEquivalent: boolean;

  // G node navigation
  viewStack: string[];
  groupMembership: Record<string, string>; // member_id → group_id
  navigateTo: (gid: string) => void;
  navigateBack: () => void;
  navigateToRoot: () => void;

  // Filters
  filters: FilterState;

  // UI feedback
  toasts: Toast[];

  // Actions
  fetchAll: () => Promise<void>;
  fetchNodeDetail: (id: string) => Promise<void>;
  fetchNeighbors: (id: string) => Promise<void>;
  clearSelection: () => void;

  createNode: (type: NodeType, label: string, description?: string, extra?: Record<string, any>) => Promise<NodeRow>;
  updateNode: (id: string, data: { label?: string; description?: string }) => Promise<void>;
  deleteNode: (id: string) => Promise<boolean>;
  createEdge: (sourceId: string, targetId: string, label: string, proofId?: string | null, description?: string) => Promise<IEdge | null>;
  deleteEdge: (id: string) => Promise<void>;

  addPropertyToNode: (nodeId: string, propertyId: string) => Promise<void>;
  removePropertyFromNode: (nodeId: string, propertyId: string) => Promise<void>;
  createProperty: (name: string, description?: string) => Promise<PropertyRow>;

  createProof: (theoremId: string, title?: string, content?: string) => Promise<ProofRow>;
  updateProof: (id: string, data: { title?: string; content?: string; isPrimary?: boolean }) => Promise<void>;
  deleteProof: (id: string) => Promise<void>;

  createDomain: (name: string, parentId?: string | null, color?: string) => Promise<DomainRow>;
  addNodeToDomain: (domainId: string, nodeId: string) => Promise<void>;
  removeNodeFromDomain: (domainId: string, nodeId: string) => Promise<void>;

  createMathIdea: (name: string, description?: string) => Promise<MathIdeaRow>;
  addMathIdeaToNode: (ideaId: string, nodeId: string) => Promise<void>;
  removeMathIdeaFromNode: (ideaId: string, nodeId: string) => Promise<void>;

  setViewMode: (mode: ViewMode) => void;
  setLayout: (layout: LayoutType) => void;
  setShowLabels: (show: boolean) => void;
  setCollapseEquivalent: (collapse: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (edge: IEdge | null) => void;
  setHoveredNode: (id: string | null) => void;

  exportGraph: () => Promise<void>;
  importGraph: (file: File) => Promise<void>;

  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  domains: [],
  mathIdeas: [],
  properties: [],
  loading: false,
  error: null,
  selectedNode: null,
  selectedEdge: null,
  hoveredNodeId: null,
  neighbors: null,
  viewMode: 'graph',
  layout: 'dagre',
  showLabels: true,
  collapseEquivalent: false,
  viewStack: [],
  groupMembership: {},

  navigateTo: (gid) => set((s) => ({ viewStack: [...s.viewStack, gid] })),
  navigateBack: () => set((s) => ({ viewStack: s.viewStack.slice(0, -1) })),
  navigateToRoot: () => set({ viewStack: [] }),

  filters: { nodeTypes: [], domainIds: [], mathIdeaIds: [], searchQuery: '' },
  toasts: [],

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [nodes, edges, domains, mathIdeas, properties, memberships] = await Promise.all([
        nodesApi.list(),
        edgesApi.list(),
        domainsApi.list(),
        mathIdeasApi.list(),
        propertiesApi.list(),
        groupsApi.getAllMemberships(),
      ]);
      const groupMembership: Record<string, string> = {};
      for (const m of memberships) {
        groupMembership[m.member_id] = m.group_id;
      }
      set({ nodes, edges, domains, mathIdeas, properties, groupMembership, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchNodeDetail: async (id: string) => {
    try {
      const node = await nodesApi.get(id);
      set({ selectedNode: node });
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  fetchNeighbors: async (id: string) => {
    try {
      const neighbors = await nodesApi.neighbors(id, 2);
      set({ neighbors });
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  clearSelection: () => set({ selectedNode: null, selectedEdge: null, neighbors: null }),

  createNode: async (type, label, description, extra) => {
    try {
      const node = await nodesApi.create({ type, label, description, ...extra });
      await get().fetchAll();
      get().addToast(`节点 "${label}" 创建成功`, 'success');
      return node;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      throw e;
    }
  },

  updateNode: async (id, data) => {
    try {
      await nodesApi.update(id, data);
      await get().fetchAll();
      if (get().selectedNode?.id === id) {
        await get().fetchNodeDetail(id);
      }
      get().addToast('节点已更新', 'success');
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  deleteNode: async (id) => {
    try {
      await nodesApi.delete(id, false);
      await get().fetchAll();
      if (get().selectedNode?.id === id) {
        set({ selectedNode: null });
      }
      get().addToast('节点已删除', 'success');
      return true;
    } catch (e: any) {
      // If there are dependents, ask for force delete
      const msg = e.message;
      if (msg.includes('dependents')) {
        try {
          await nodesApi.delete(id, true);
          await get().fetchAll();
          if (get().selectedNode?.id === id) {
            set({ selectedNode: null });
          }
          get().addToast('节点已强制删除（级联删除关联项）', 'info');
          return true;
        } catch (e2: any) {
          get().addToast(e2.message, 'error');
          return false;
        }
      }
      get().addToast(msg, 'error');
      return false;
    }
  },

  createEdge: async (sourceId, targetId, label, proofId, description) => {
    try {
      const edge = await edgesApi.create({ sourceId, targetId, label, proofId, description });
      await get().fetchAll();
      get().addToast('边创建成功', 'success');
      return edge;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      return null;
    }
  },

  deleteEdge: async (id) => {
    try {
      await edgesApi.delete(id);
      await get().fetchAll();
      set({ selectedEdge: null });
      get().addToast('边已删除', 'success');
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  addPropertyToNode: async (nodeId, propertyId) => {
    try {
      await nodesApi.addProperty(nodeId, propertyId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  removePropertyFromNode: async (nodeId, propertyId) => {
    try {
      await nodesApi.removeProperty(nodeId, propertyId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  createProperty: async (name, description) => {
    try {
      const prop = await propertiesApi.create({ name, description });
      await get().fetchAll();
      return prop;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      throw e;
    }
  },

  createProof: async (theoremId, title, content) => {
    try {
      const proof = await proofsApi.create({ theoremId, title, content });
      if (get().selectedNode?.id === theoremId) {
        await get().fetchNodeDetail(theoremId);
      }
      get().addToast('证明已创建', 'success');
      return proof;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      throw e;
    }
  },

  updateProof: async (id, data) => {
    try {
      await proofsApi.update(id, data);
      const sel = get().selectedNode;
      if (sel) {
        await get().fetchNodeDetail(sel.id);
      }
      get().addToast('证明已更新', 'success');
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  deleteProof: async (id) => {
    try {
      await proofsApi.delete(id);
      const sel = get().selectedNode;
      if (sel) {
        await get().fetchNodeDetail(sel.id);
      }
      await get().fetchAll();
      get().addToast('证明已删除', 'success');
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  createDomain: async (name, parentId, color) => {
    try {
      const domain = await domainsApi.create({ name, parentId, color });
      await get().fetchAll();
      return domain;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      throw e;
    }
  },

  addNodeToDomain: async (domainId, nodeId) => {
    try {
      await domainsApi.addNode(domainId, nodeId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  removeNodeFromDomain: async (domainId, nodeId) => {
    try {
      await domainsApi.removeNode(domainId, nodeId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  createMathIdea: async (name, description) => {
    try {
      const idea = await mathIdeasApi.create({ name, description });
      await get().fetchAll();
      return idea;
    } catch (e: any) {
      get().addToast(e.message, 'error');
      throw e;
    }
  },

  addMathIdeaToNode: async (ideaId, nodeId) => {
    try {
      await mathIdeasApi.addNode(ideaId, nodeId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  removeMathIdeaFromNode: async (ideaId, nodeId) => {
    try {
      await mathIdeasApi.removeNode(ideaId, nodeId);
      if (get().selectedNode?.id === nodeId) {
        await get().fetchNodeDetail(nodeId);
      }
      await get().fetchAll();
    } catch (e: any) {
      get().addToast(e.message, 'error');
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setLayout: (layout) => set({ layout }),
  setShowLabels: (show) => set({ showLabels: show }),
  setCollapseEquivalent: (collapse) => set({ collapseEquivalent: collapse }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  selectNode: (id) => {
    if (id) {
      get().fetchNodeDetail(id);
      get().fetchNeighbors(id);
    } else {
      set({ selectedNode: null, neighbors: null });
    }
  },
  selectEdge: (edge) => set({ selectedEdge: edge }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  exportGraph: async () => {
    // TODO: rewrite for v2 model
    get().addToast('导出功能待适配新模型', 'info');
  },

  importGraph: async (_file: File) => {
    // TODO: rewrite for v2 model
    get().addToast('导入功能待适配新模型', 'info');
  },

  addToast: (message, type) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
