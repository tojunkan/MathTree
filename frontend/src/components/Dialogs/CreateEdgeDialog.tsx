import { useState, useMemo } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import type { NodeRow, PropertyRow } from '../../types';

interface CreateEdgeDialogProps {
  onClose: () => void;
}

export function CreateEdgeDialog({ onClose }: CreateEdgeDialogProps) {
  const { nodes, createEdge, fetchNodeDetail } = useGraphStore();

  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sourceProperties, setSourceProperties] = useState<PropertyRow[]>([]);
  const [showSourceProps, setShowSourceProps] = useState(false);

  // Load source node's properties when source changes
  const handleSourceChange = async (id: string) => {
    setSourceId(id);
    setLabel('');
    if (id) {
      try {
        const res = await fetch(`/api/nodes/${id}`);
        const node = await res.json();
        setSourceProperties(node.properties || []);
        setShowSourceProps(true);
      } catch {
        setSourceProperties([]);
      }
    } else {
      setSourceProperties([]);
      setShowSourceProps(false);
    }
  };

  const sourceNode = nodes.find((n) => n.id === sourceId);
  const targetNode = nodes.find((n) => n.id === targetId);
  const filteredTargets = nodes.filter((n) => n.id !== sourceId);

  const handleSubmit = async () => {
    if (!sourceId || !targetId || !label.trim()) return;
    setSubmitting(true);
    try {
      await createEdge(sourceId, targetId, label.trim(), null, description);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-[28rem] p-5">
        <h2 className="text-lg font-semibold mb-4">创建边</h2>
        <p className="text-xs text-gray-500 mb-4">
          边 A→B 标签为 P，表示：要推出 B，需要 A 的性质 P。
        </p>

        {/* Source */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">源节点 (提供性质的一方)</label>
          <select
            value={sourceId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
          >
            <option value="">选择源节点...</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                [{n.type}] {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source properties reference */}
        {showSourceProps && (
          <div className="mb-3 p-2 bg-gray-800/50 rounded text-xs">
            <div className="text-gray-400 mb-1">
              {sourceNode?.label} 的性质表 ({sourceProperties.length})：
            </div>
            {sourceProperties.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {sourceProperties.map((p) => (
                  <button
                    key={p.id}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      label === p.name
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setLabel(p.name)}
                    title={p.description}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">
                该节点暂无性质。请先在节点详情中为其添加性质。
              </div>
            )}
          </div>
        )}

        {/* Target */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">目标节点</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
          >
            <option value="">选择目标节点...</option>
            {filteredTargets.map((n) => (
              <option key={n.id} value={n.id}>
                [{n.type}] {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* Label (property name) */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">性质名称</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-600 focus:outline-none"
            placeholder="例如: 完备性、正交性、介值性"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1.5">说明 (可选)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-600 focus:outline-none"
            placeholder="为什么这个性质在此处是关键？"
          />
        </div>

        {/* Preview */}
        {sourceId && targetId && label && (
          <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400 text-center">
            预览：<span className="text-white">{sourceNode?.label}</span>
            <span className="text-gray-600"> —[</span>
            <span className="text-blue-400">{label}</span>
            <span className="text-gray-600">]→ </span>
            <span className="text-white">{targetNode?.label}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!sourceId || !targetId || !label.trim() || submitting}
            className="px-4 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
          >
            {submitting ? '创建中...' : '创建边'}
          </button>
        </div>
      </div>
    </div>
  );
}
