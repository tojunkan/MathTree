import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { groupsApi } from '../../api/client';
import type { NodeRow } from '../../types';

interface CreateGroupDialogProps {
  onClose: () => void;
  preSelectedIds?: string[];
}

export function CreateGroupDialog({ onClose, preSelectedIds = [] }: CreateGroupDialogProps) {
  const { nodes, fetchAll, addToast } = useGraphStore();
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(preSelectedIds);
  const [submitting, setSubmitting] = useState(false);

  const availableNodes = nodes.filter((n) => n.type !== 'Idea'); // G nodes can't be members of another G? Actually they can (nesting), but for simplicity, filter for now

  const toggleNode = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!label.trim() || selectedIds.length < 2) return;
    setSubmitting(true);
    try {
      await groupsApi.create({
        label: label.trim(),
        description,
        memberIds: selectedIds,
      });
      await fetchAll();
      addToast(`虚顶点 "${label.trim()}" 创建成功（${selectedIds.length} 个成员）`, 'success');
      onClose();
    } catch (e: any) {
      addToast(e.message, 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-96 p-5 max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-1">封装为虚顶点</h2>
        <p className="text-xs text-gray-500 mb-4">
          将选中的节点封装为一个 G 节点（虚顶点）。虚顶点本身不携带证明，但自动继承所有成员共有的性质。
        </p>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">虚顶点名称</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            placeholder="例如: 完备性"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">描述 (可选)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
            placeholder="简要说明这个封装的含义"
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <label className="block text-xs text-gray-400 mb-1.5">
            选择成员 ({selectedIds.length} 个已选，至少 2 个)
          </label>
          <div className="flex-1 overflow-y-auto border border-gray-800 rounded p-2 space-y-0.5">
            {availableNodes.map((n) => (
              <label
                key={n.id}
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
                  selectedIds.includes(n.id)
                    ? 'bg-orange-900/30 border border-orange-800'
                    : 'hover:bg-gray-800 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(n.id)}
                  onChange={() => toggleNode(n.id)}
                  className="rounded bg-gray-800"
                />
                <span className={`text-xs font-bold ${
                  n.type === 'Entity' ? 'text-green-400' : n.type === 'Statement' ? 'text-purple-400' : 'text-orange-400'
                }`}>
                  [{n.type}]
                </span>
                <span className="text-gray-300 truncate">{n.label}</span>
              </label>
            ))}
            {availableNodes.length === 0 && (
              <div className="text-xs text-gray-600 py-4 text-center">没有可用的节点</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim() || selectedIds.length < 2 || submitting}
            className="px-4 py-2 text-sm bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
          >
            {submitting ? '创建中...' : `封装 (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
