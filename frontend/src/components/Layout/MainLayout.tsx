import { useState } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { useKeyboard } from '../../hooks/useKeyboard';
import { Sidebar } from './Sidebar';
import { GraphView } from '../Graph/GraphView';
import { ListView } from '../ListView/ListView';
import { DomainView } from '../DomainView/DomainView';
import { NodeDetailPanel } from '../NodeDetail/NodeDetailPanel';
import { FullscreenOverlay } from '../NodeDetail/FullscreenOverlay';
import { CreateNodeDialog } from '../Dialogs/CreateNodeDialog';
import { CreateEdgeDialog } from '../Dialogs/CreateEdgeDialog';
import { CreateGroupDialog } from '../Dialogs/CreateGroupDialog';
import type { ProofRow } from '../../types';

type OverlayState =
  | { mode: 'proof'; proof: ProofRow }
  | { mode: 'properties' }
  | null;

export function MainLayout() {
  const { viewMode, selectedNode, clearSelection } = useGraphStore();
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [showCreateEdge, setShowCreateEdge] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [overlay, setOverlay] = useState<OverlayState>(null);

  // Keyboard shortcuts
  useKeyboard(
    () => setShowCreateNode(true),
    () => setShowCreateEdge(true)
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-gray-800 bg-gray-900`}>
        {sidebarOpen && (
          <Sidebar
            onCreateNode={() => setShowCreateNode(true)}
            onCreateEdge={() => setShowCreateEdge(true)}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-3 gap-2 flex-shrink-0">
          <button
            className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="切换侧边栏"
          >
            ☰
          </button>
          <span className="text-gray-500 text-sm font-medium">MathTree</span>
          <div className="flex-1" />
          <ViewModeTabs />
        </div>

        {/* View area with optional overlay */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'graph' && <GraphView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'domain' && <DomainView />}

          {/* Fullscreen overlay for expanded proofs/properties */}
          {overlay && (
            <FullscreenOverlay
              mode={overlay.mode}
              proof={overlay.mode === 'proof' ? (overlay as { mode: 'proof'; proof: ProofRow }).proof : undefined}
              onClose={() => setOverlay(null)}
            />
          )}
        </div>
      </div>

      {/* Detail Panel (right side) */}
      {selectedNode && (
        <div className="w-72 flex-shrink-0 border-l border-gray-800 bg-gray-900 overflow-y-auto">
          <NodeDetailPanel
            onClose={clearSelection}
            onExpandProof={(proof) => setOverlay({ mode: 'proof', proof })}
            onExpandProperties={() => setOverlay({ mode: 'properties' })}
          />
        </div>
      )}

      {/* Dialogs */}
      {showCreateNode && (
        <CreateNodeDialog onClose={() => setShowCreateNode(false)} />
      )}
      {showCreateEdge && (
        <CreateEdgeDialog onClose={() => setShowCreateEdge(false)} />
      )}
      {showCreateGroup && (
        <CreateGroupDialog onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
}

function ViewModeTabs() {
  const { viewMode, setViewMode } = useGraphStore();
  const modes = [
    { key: 'graph' as const, label: '图' },
    { key: 'list' as const, label: '列表' },
    { key: 'domain' as const, label: '域' },
  ];

  return (
    <div className="flex gap-1">
      {modes.map((m) => (
        <button
          key={m.key}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            viewMode === m.key
              ? 'bg-blue-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          onClick={() => setViewMode(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
