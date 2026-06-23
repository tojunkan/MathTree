import { useGraphStore } from '../../stores/graphStore';
import type { NodeType } from '../../types';
import { SearchBar } from '../Search/SearchBar';

interface SidebarProps {
  onCreateNode: () => void;
  onCreateEdge: () => void;
  onCreateGroup: () => void;
}

export function Sidebar({ onCreateNode, onCreateEdge, onCreateGroup }: SidebarProps) {
  const {
    nodes, edges, domains, mathIdeas, properties,
    filters, setFilters,
    exportGraph, importGraph,
    loading,
  } = useGraphStore();

  const nodeCounts = {
    I: nodes.filter((n) => n.type === 'Entity').length,
    T: nodes.filter((n) => n.type === 'Statement').length,
  };

  const toggleNodeType = (type: NodeType) => {
    const current = filters.nodeTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilters({ nodeTypes: next });
  };

  const toggleDomain = (id: string) => {
    const current = filters.domainIds;
    const next = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    setFilters({ domainIds: next });
  };

  const toggleMathIdea = (id: string) => {
    const current = filters.mathIdeaIds;
    const next = current.includes(id)
      ? current.filter((m) => m !== id)
      : [...current, id];
    setFilters({ mathIdeaIds: next });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) importGraph(file);
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-y-auto">
      {/* Search */}
      <SearchBar />

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={onCreateNode}
          className="flex-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded transition-colors"
        >
          + 节点
        </button>
        <button
          onClick={onCreateEdge}
          className="flex-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded transition-colors"
          disabled={nodes.length < 2}
        >
          + 边
        </button>
        <button
          onClick={onCreateGroup}
          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded transition-colors"
          disabled={nodes.length < 2}
          title="将选中的节点封装为一个虚顶点"
        >
          ⊞ 封装
        </button>
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 flex gap-3">
        <span>I: {nodeCounts.I}</span>
        <span>T: {nodeCounts.T}</span>
        <span>边: {edges.length}</span>
      </div>

      {/* Filter: Node Types */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">节点类型</h3>
        <div className="flex gap-3">
          {(Object.entries({Entity:'实体', Statement:'陈述'}) as [NodeType, string][]).map(([t, label]) => (
            <label key={t} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.nodeTypes.includes(t)}
                onChange={() => toggleNodeType(t)}
                className="rounded bg-gray-800 border-gray-600"
              />
              <span className={t === 'Entity' ? 'text-green-400' : 'text-orange-400'}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter: Domains */}
      {domains.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">域</h3>
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {domains.map((d) => (
              <label key={d.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.domainIds.includes(d.id)}
                  onChange={() => toggleDomain(d.id)}
                  className="rounded bg-gray-800"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-gray-300 truncate">{d.name}</span>
                <span className="text-gray-600 text-xs ml-auto">{d.node_count ?? 0}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter: Math Ideas */}
      {mathIdeas.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">数学思想</h3>
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {mathIdeas.map((mi) => (
              <label key={mi.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.mathIdeaIds.includes(mi.id)}
                  onChange={() => toggleMathIdea(mi.id)}
                  className="rounded bg-gray-800"
                />
                <span className="text-purple-400 truncate">{mi.name}</span>
                <span className="text-gray-600 text-xs ml-auto">{mi.node_count ?? 0}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Import/Export */}
      <div className="border-t border-gray-800 pt-2 flex gap-2">
        <button
          onClick={exportGraph}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
        >
          导出
        </button>
        <button
          onClick={handleImport}
          className="flex-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
        >
          导入
        </button>
      </div>

      {loading && (
        <div className="text-xs text-gray-500 animate-pulse">加载中...</div>
      )}
    </div>
  );
}
