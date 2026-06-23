import { useEffect } from 'react';
import { useGraphStore } from '../stores/graphStore';

/**
 * Global keyboard shortcuts for MathTree.
 *
 * Ctrl+N     — Create new node
 * Ctrl+E     — Create new edge
 * Delete     — Delete selected node/edge
 * Escape     — Clear selection / close panel
 * Ctrl+F     — Focus search bar
 * Ctrl+S     — Export graph
 * 1          — Switch to graph view
 * 2          — Switch to list view
 * 3          — Switch to domain view
 */
export function useKeyboard(onCreateNode: () => void, onCreateEdge: () => void) {
  const store = useGraphStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'n') {
        e.preventDefault();
        onCreateNode();
      } else if (ctrl && e.key === 'e') {
        e.preventDefault();
        onCreateEdge();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (store.selectedNode) {
          store.deleteNode(store.selectedNode.id);
        } else if (store.selectedEdge) {
          store.deleteEdge(store.selectedEdge.id);
        }
      } else if (e.key === 'Escape') {
        store.clearSelection();
      } else if (ctrl && e.key === 'f') {
        e.preventDefault();
        // Focus search bar
        const input = document.querySelector('input[type="text"][placeholder*="搜索"]') as HTMLInputElement;
        input?.focus();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        store.exportGraph();
      } else if (e.key === '1') {
        store.setViewMode('graph');
      } else if (e.key === '2') {
        store.setViewMode('list');
      } else if (e.key === '3') {
        store.setViewMode('domain');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store, onCreateNode, onCreateEdge]);
}
