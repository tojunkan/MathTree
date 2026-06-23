import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';
import type { ProofRow } from '../../types';

interface NodeDetailPanelProps {
  onClose: () => void;
  onExpandProof?: (proof: ProofRow) => void;
  onExpandProperties?: () => void;
}

export function NodeDetailPanel({ onClose, onExpandProof, onExpandProperties }: NodeDetailPanelProps) {
  const store = useGraphStore();
  const node = store.selectedNode;
  const {
    updateNode, deleteNode,
    addPropertyToNode, removePropertyFromNode, createProperty,
    createProof, updateProof, deleteProof,
    addMathIdeaToNode, removeMathIdeaFromNode,
    addNodeToDomain, removeNodeFromDomain,
    properties: allProperties, domains, mathIdeas,
  } = store;

  const [editingLabel, setEditingLabel] = useState(false);
  const [label, setLabel] = useState(node?.label || '');

  if (!node) return null;

  const isEntity = node.type === 'Entity';
  const isStatement = node.type === 'Statement';
  const isExpandable = (node.groupMembers?.length ?? 0) > 0;
  const primaryProof = node.proofs?.find((p) => p.is_primary) || node.proofs?.[0];

  const handleUpdateLabel = async () => {
    if (label.trim() && label !== node.label) {
      await updateNode(node.id, { label: label.trim() });
    }
    setEditingLabel(false);
  };

  const handleDelete = async () => {
    if (confirm(`确认删除节点 "${node.label}"？此操作不可撤销。`)) {
      await deleteNode(node.id);
      onClose();
    }
  };

  const handleAddProperty = async () => {
    const name = prompt('新性质名称：');
    if (!name?.trim()) return;
    const desc = prompt('性质描述（可选）：') || '';
    try {
      const prop = await createProperty(name.trim(), desc);
      await addPropertyToNode(node.id, prop.id);
    } catch { /* error handled in store */ }
  };

  const handleSetPrimary = async (proofId: string) => {
    await updateProof(proofId, { isPrimary: true });
  };

  const handleDeleteProof = async (proofId: string) => {
    if (confirm('确认删除此证明？')) {
      await deleteProof(proofId);
    }
  };

  const handleCreateProof = async () => {
    const title = prompt('证明标题：', '新证明');
    if (!title?.trim()) return;
    await createProof(node.id, title.trim());
  };

  // Available properties not yet on this node
  const availableProperties = allProperties.filter(
    (p) => !node.properties?.find((np) => np.id === p.id)
  );

  // Content snippet (first ~100 chars of description)
  const descSnippet = (node.description || '').replace(/[*$\\_{}#]/g, '').slice(0, 100);

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-1.5 py-0.5 text-xs rounded font-bold flex-shrink-0 ${
            isEntity ? 'bg-green-900 text-green-300' : isExpandable ? 'bg-orange-900/70 text-orange-300 border border-dashed border-orange-500' : 'bg-orange-900 text-orange-300'
          }`}>
            {isEntity ? 'I' : isExpandable ? 'G' : 'T'}
          </span>
          {editingLabel ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleUpdateLabel}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateLabel()}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-sm text-white w-full"
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-semibold cursor-pointer hover:text-blue-400 truncate"
              onClick={() => { setLabel(node.label); setEditingLabel(true); }}
              title="点击编辑名称"
            >
              {node.label}
            </h3>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none flex-shrink-0">&times;</button>
      </div>

      {/* Description (brief) */}
      {descSnippet && (
        <p className="text-xs text-gray-500 leading-relaxed">{descSnippet}{descSnippet.length >= 100 ? '…' : ''}</p>
      )}

      {/* === G node: Member list === */}
      {isExpandable && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              成员 ({node.groupMembers?.length || 0})
            </span>
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => {}} // G-expand handled by GraphCanvas dblclick
            >
              展开子图 →
            </button>
          </div>
          {node.groupMembers && node.groupMembers.length > 0 ? (
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {node.groupMembers.map((m: any) => (
                <div key={m.id} className="flex items-center gap-1 text-xs py-0.5">
                  <span className={`w-4 text-center flex-shrink-0 ${
                    m.type === 'Entity' ? 'text-green-400' : m.type === 'Statement' ? 'text-orange-400' : 'text-orange-300'
                  }`}>
                    {m.type}
                  </span>
                  <button
                    className="text-gray-300 hover:text-blue-400 truncate"
                    onClick={() => store.selectNode(m.id)}
                  >
                    {m.label}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-600">暂无成员</span>
          )}
          {/* Inherited properties (read-only) */}
          {node.properties && node.properties.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">继承性质（交集）：</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {node.properties.map((p) => (
                  <span key={p.id} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400"
                    title={p.description}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === Properties (brief, non-G only) === */}
      {!isExpandable && (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            性质 ({node.properties?.length || 0})
          </span>
          {node.properties && node.properties.length > 0 && onExpandProperties && (
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={onExpandProperties}
            >
              展开 →
            </button>
          )}
        </div>
        {node.properties && node.properties.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {node.properties.slice(0, 4).map((p) => (
              <span key={p.id} className="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
                title={p.description}>
                {p.name}
              </span>
            ))}
            {node.properties.length > 4 && (
              <span className="text-xs text-gray-600">+{node.properties.length - 4} 更多</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-600">暂无</span>
        )}
        <div className="flex gap-1 mt-1">
          <button onClick={handleAddProperty}
            className="text-xs text-gray-500 hover:text-gray-300 border border-dashed border-gray-700 rounded px-1.5 py-0.5">
            + 添加
          </button>
          {availableProperties.length > 0 && (
            <select
              className="bg-gray-800 text-xs text-gray-400 border border-gray-700 rounded px-1 py-0.5 w-28"
              value=""
              onChange={(e) => { if (e.target.value) addPropertyToNode(node.id, e.target.value); }}
            >
              <option value="">已有性质…</option>
              {availableProperties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      )}

      {/* === Proofs (brief, T only) === */}
      {isStatement && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              证明 ({node.proofs?.length || 0})
            </span>
            {primaryProof && onExpandProof && (
              <button
                className="text-xs text-blue-400 hover:text-blue-300"
                onClick={() => onExpandProof(primaryProof)}
              >
                展开 →
              </button>
            )}
          </div>
          {primaryProof ? (
            <div className="space-y-2">
              <div
                className="p-2 bg-gray-800/50 rounded text-xs text-gray-400 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => onExpandProof?.(primaryProof)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{primaryProof.title}</span>
                  {primaryProof.is_primary ? <span className="text-yellow-500 text-xs">★ 主证明</span> : null}
                </div>
                <div className="text-gray-600 mt-0.5 line-clamp-2">
                  {(primaryProof.content || '暂无内容').replace(/[#*${}]/g, '').slice(0, 80)}
                </div>
              </div>
              {/* Other proofs — just show titles */}
              {node.proofs && node.proofs.length > 1 && (
                <div className="space-y-0.5">
                  {node.proofs.filter((p) => p.id !== primaryProof.id).map((p) => (
                    <div key={p.id} className="flex items-center gap-1 text-xs">
                      <button
                        className="text-gray-500 hover:text-blue-400 truncate"
                        onClick={() => onExpandProof?.(p)}
                      >
                        {p.title}
                      </button>
                      <button
                        className="text-gray-600 hover:text-yellow-500 ml-auto flex-shrink-0"
                        onClick={() => handleSetPrimary(p.id)}
                        title="设为主证明"
                      >
                        ☆
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-400 flex-shrink-0"
                        onClick={() => handleDeleteProof(p.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={handleCreateProof}
                className="text-xs text-gray-500 hover:text-gray-300">
                + 添加证明
              </button>
            </div>
          ) : (
            <div>
              <span className="text-xs text-gray-600">暂无证明</span>
              <button onClick={handleCreateProof}
                className="ml-2 text-xs text-gray-500 hover:text-gray-300">
                + 添加
              </button>
            </div>
          )}
        </div>
      )}

      {/* === Domains (brief) === */}
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">域</span>
        {node.domains && node.domains.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {node.domains.map((d) => (
              <span key={d.id} className="px-1.5 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: d.color + '99' }}>
                {d.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-600">未分类</span>
        )}
        {domains.filter((d) => !node.domains?.find((nd) => nd.id === d.id)).length > 0 && (
          <select
            className="bg-gray-800 text-xs text-gray-400 border border-gray-700 rounded px-1 py-0.5 mt-1 w-full"
            value=""
            onChange={(e) => { if (e.target.value) addNodeToDomain(e.target.value, node.id); }}
          >
            <option value="">+ 添加到域</option>
            {domains.filter((d) => !node.domains?.find((nd) => nd.id === d.id)).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* === Math Ideas (brief) === */}
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">数学思想</span>
        {node.mathIdeas && node.mathIdeas.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {node.mathIdeas.map((mi) => (
              <span key={mi.id} className="px-1.5 py-0.5 bg-purple-900/50 rounded text-xs text-purple-300">
                {mi.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-600">暂无</span>
        )}
        {mathIdeas.filter((mi) => !node.mathIdeas?.find((nmi) => nmi.id === mi.id)).length > 0 && (
          <select
            className="bg-gray-800 text-xs text-gray-400 border border-gray-700 rounded px-1 py-0.5 mt-1 w-full"
            value=""
            onChange={(e) => { if (e.target.value) addMathIdeaToNode(e.target.value, node.id); }}
          >
            <option value="">+ 添加思想标签</option>
            {mathIdeas.filter((mi) => !node.mathIdeas?.find((nmi) => nmi.id === mi.id)).map((mi) => (
              <option key={mi.id} value={mi.id}>{mi.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Connections */}
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">连接</span>
        <ConnectionsSummary nodeId={node.id} />
      </div>

      {/* Danger */}
      <div className="border-t border-gray-800 pt-2">
        <button
          onClick={handleDelete}
          className="w-full px-3 py-1.5 text-xs text-red-400 border border-red-900/50 rounded hover:bg-red-900/30 transition-colors"
        >
          删除此节点
        </button>
      </div>
    </div>
  );
}

function ConnectionsSummary({ nodeId }: { nodeId: string }) {
  const edges = useGraphStore((s) => s.edges);
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);

  const incoming = edges.filter((e) => e.target_id === nodeId);
  const outgoing = edges.filter((e) => e.source_id === nodeId);

  return (
    <div className="space-y-1 text-xs">
      {incoming.length > 0 && (
        <div className="flex items-center gap-1 text-gray-500">
          <span>← {incoming.length} 入</span>
          <span className="text-gray-700">·</span>
        </div>
      )}
      {outgoing.length > 0 && (
        <div className="flex items-center gap-1 text-gray-500">
          <span>→ {outgoing.length} 出</span>
        </div>
      )}
      {incoming.length === 0 && outgoing.length === 0 && (
        <span className="text-gray-600">无连接</span>
      )}
    </div>
  );
}
