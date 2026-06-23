import type { StylesheetStyle } from 'cytoscape';

/**
 * Cytoscape stylesheet for MathTree graph visualization.
 *
 * Node colors:
 *   I (Item)  — green (#22c55e)
 *   T (Theorem) — orange (#f97316)
 *
 * Edge: unified solid line with label, arrow showing direction.
 */
export const cytoscapeStyles: StylesheetStyle[] = [
  // === Node styles (all rounded rectangles) ===
  {
    selector: 'node',
    style: {
      'background-color': '#374151',
      'label': 'data(label)',
      'color': '#e5e7eb',
      'font-size': '13px',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '200px',
      'text-overflow-wrap': 'anywhere',
      'shape': 'round-rectangle',
      'border-width': 2,
      'border-color': '#4b5563',
      'width': 'mapData(degree, 0, 20, 55, 130)',
      'height': 'mapData(degree, 0, 20, 45, 100)',
      'padding': '10px',
      'transition-property': 'background-color, border-color, width, height',
      'transition-duration': 200,
    },
  },
  // Entity (绿色)
  {
    selector: 'node[type="Entity"]',
    style: { 'background-color': '#15803d', 'border-color': '#22c55e' },
  },
  // Statement (橙色)
  {
    selector: 'node[type="Statement"]',
    style: { 'background-color': '#c2410c', 'border-color': '#f97316' },
  },
  // Scope (灰色虚线)
  {
    selector: 'node[type="Scope"]',
    style: {
      'background-color': '#4b5563', 'border-color': '#9ca3af',
      'border-style': 'dashed', 'border-width': 2,
    },
  },
  // Reference (紫色虚线 + 小尺寸)
  {
    selector: 'node[type="Reference"]',
    style: {
      'background-color': '#5b21b6', 'border-color': '#a78bfa',
      'border-style': 'dashed', 'width': 45, 'height': 30, 'font-size': '11px',
    },
  },
  // Idea (靛色)
  {
    selector: 'node[type="Idea"]',
    style: { 'background-color': '#3730a3', 'border-color': '#818cf8', 'shape': 'rectangle', 'width': 60, 'height': 28, 'font-size': '10px' },
  },
  // 选中节点
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#fbbf24',
    },
  },
  // 悬停节点
  {
    selector: 'node:hover',
    style: {
      'border-color': '#60a5fa',
      'border-width': 3,
    },
  },

  // === Edge styles ===
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#6b7280',
      'target-arrow-color': '#6b7280',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'color': '#9ca3af',
      'font-size': '10px',
      'text-background-color': '#1f2937',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px',
      'arrow-scale': 1.2,
    },
  },
  // 选中的边
  {
    selector: 'edge:selected',
    style: {
      'width': 4,
      'line-color': '#fbbf24',
      'target-arrow-color': '#fbbf24',
    },
  },
  // 悬停边
  {
    selector: 'edge:hover',
    style: {
      'width': 3,
      'line-color': '#60a5fa',
      'target-arrow-color': '#60a5fa',
    },
  },
  // 等价边（双向）
  {
    selector: 'edge[equivalent="true"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#a78bfa',
      'target-arrow-color': '#a78bfa',
    },
  },
  // 半透明（非当前路径）
  {
    selector: 'edge.dimmed',
    style: {
      'opacity': 0.15,
    },
  },
  {
    selector: 'node.dimmed',
    style: {
      'opacity': 0.3,
    },
  },
];
