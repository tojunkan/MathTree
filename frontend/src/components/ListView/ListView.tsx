import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import type { NodeRow } from '../../types';

type SortKey = 'label' | 'type' | 'created_at';
type SortDir = 'asc' | 'desc';

export function ListView() {
  const { nodes, selectNode } = useGraphStore();
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...nodes].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'type') return dir * a.type.localeCompare(b.type);
    if (sortKey === 'created_at') return dir * (a.created_at || '').localeCompare(b.created_at || '');
    return dir * a.label.localeCompare(b.label);
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <span className="text-gray-700 ml-1">↕</span>;
    return <span className="text-gray-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="w-full h-full overflow-auto p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-800">
            <th className="pb-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('label')}>
              名称 <SortIcon col="label" />
            </th>
            <th className="pb-2 cursor-pointer hover:text-gray-300 w-20" onClick={() => handleSort('type')}>
              类型 <SortIcon col="type" />
            </th>
            <th className="pb-2 w-64">描述</th>
            <th className="pb-2 cursor-pointer hover:text-gray-300 w-36" onClick={() => handleSort('created_at')}>
              创建时间 <SortIcon col="created_at" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => (
            <tr
              key={n.id}
              className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => selectNode(n.id)}
            >
              <td className="py-2 pr-4">
                <span className="text-gray-200 font-medium">{n.label}</span>
              </td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  n.type === 'Entity' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
                }`}>
                  {n.type === 'Entity' ? 'Entity' : 'Statement'}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-500 truncate max-w-xs">
                {n.description?.slice(0, 80) || '-'}
              </td>
              <td className="py-2 text-gray-600 text-xs">
                {n.created_at ? new Date(n.created_at).toLocaleDateString('zh-CN') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {nodes.length === 0 && (
        <div className="text-center text-gray-600 py-12">暂无节点</div>
      )}
    </div>
  );
}
