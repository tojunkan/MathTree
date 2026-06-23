/**
 * Predefined layout configurations for Cytoscape.
 */
export const layoutConfigs: Record<string, Record<string, unknown>> = {
  dagre: {
    name: 'dagre',
    nodeSep: 60,
    edgeSep: 30,
    rankSep: 100,
    rankDir: 'TB',
    animate: true,
    animationDuration: 500,
  },
  cose: {
    name: 'cose',
    animate: true,
    animationDuration: 800,
    nodeRepulsion: () => 8000,
    idealEdgeLength: () => 100,
    gravity: 0.3,
    numIter: 2000,
  },
  breadthfirst: {
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.2,
    animate: true,
    animationDuration: 500,
  },
  circle: {
    name: 'circle',
    animate: true,
    animationDuration: 500,
  },
};
