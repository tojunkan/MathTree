import { useGraphStore } from '../../stores/graphStore';
import type { LayoutType } from '../../types';

export function GraphToolbar() {
  const {
    layout, setLayout,
    showLabels, setShowLabels,
    viewStack, navigateTo, navigateBack, navigateToRoot,
    selectedNode, nodes,
  } = useGraphStore();

  const currentGroupId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
  const currentGroup = currentGroupId ? nodes.find((n) => n.id === currentGroupId) : null;
  const canEnter = selectedNode != null;

  const layouts: { key: LayoutType; label: string }[] = [
    { key: 'dagre', label: '层级' },
    { key: 'cose', label: '力导向' },
    { key: 'breadthfirst', label: '广度优先' },
    { key: 'circle', label: '环形' },
  ];

  return (
    <div className="h-9 bg-gray-900 border-b border-gray-800 flex items-center px-3 gap-2 flex-shrink-0">
      {/* Navigation */}
      <button
        className={`px-2 py-0.5 text-xs rounded transition-colors ${
          viewStack.length > 0
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        onClick={() => viewStack.length > 0 && navigateBack()}
        disabled={viewStack.length === 0}
        title="返回上一层"
      >
        ← 返回
      </button>

      <button
        className={`px-2 py-0.5 text-xs rounded transition-colors ${
          canEnter
            ? 'bg-orange-800 text-orange-200 hover:bg-orange-700'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        onClick={() => canEnter && selectedNode && navigateTo(selectedNode.id)}
        disabled={!canEnter}
        title="进入选中虚顶点的内部"
      >
        进入 →
      </button>

      <div className="w-px h-4 bg-gray-700" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-0.5 text-xs">
        <button
          className={`px-1.5 py-0.5 rounded transition-colors ${
            viewStack.length === 0
              ? 'bg-blue-900 text-blue-300'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
          onClick={navigateToRoot}
        >
          📊 全局
        </button>
        {viewStack.map((gid, i) => {
          const g = nodes.find((n) => n.id === gid);
          const isLast = i === viewStack.length - 1;
          return (
            <span key={gid} className="flex items-center gap-0.5">
              <span className="text-gray-700">▸</span>
              <button
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  isLast
                    ? 'bg-orange-900 text-orange-300'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => {
                  // Navigate to this level by popping deeper entries
                  while (useGraphStore.getState().viewStack.length > i + 1) {
                    useGraphStore.getState().navigateBack();
                  }
                }}
              >
                {g?.label || gid}
              </button>
            </span>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Layout selector */}
      <div className="flex gap-0.5">
        {layouts.map((l) => (
          <button
            key={l.key}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              layout === l.key
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => setLayout(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-gray-700" />

      {/* Labels toggle */}
      <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => setShowLabels(e.target.checked)}
          className="rounded bg-gray-800 border-gray-600"
        />
        标签
      </label>
    </div>
  );
}
