import { useRef, useEffect, useCallback } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useGraphStore } from '../../stores/graphStore';
import { cytoscapeStyles } from '../../utils/cytoscapeStyles';
import { layoutConfigs } from '../../utils/cytoscapeLayouts';

cytoscape.use(dagre);

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const {
    nodes, edges, layout, showLabels,
    filters, viewStack, groupMembership,
    selectedNode, selectNode, selectEdge, setHoveredNode,
    navigateTo,
  } = useGraphStore();

  // Determine the current "scope": which G node are we inside?
  const currentGroupId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;

  // Build the set of nodes/edges visible at this level
  let visibleNodes = nodes;
  let visibleEdges = edges;

  if (currentGroupId === null) {
    // === TOP LEVEL: hide all nodes that are members of any G ===
    const memberIds = new Set(Object.keys(groupMembership));
    // Also collect internal edges (both endpoints are members of the SAME group)
    const internalEdgeIds = new Set<string>();
    // For each G, find edges where both source and target are its members
    const groupMembers = new Map<string, Set<string>>();
    for (const [mid, gid] of Object.entries(groupMembership)) {
      if (!groupMembers.has(gid)) groupMembers.set(gid, new Set());
      groupMembers.get(gid)!.add(mid);
    }
    for (const [, memberSet] of groupMembers) {
      for (const e of edges) {
        if (memberSet.has(e.source_id) && memberSet.has(e.target_id)) {
          internalEdgeIds.add(e.id);
        }
      }
    }
    visibleNodes = nodes.filter((n) => !memberIds.has(n.id));
    visibleEdges = edges.filter((e) => !internalEdgeIds.has(e.id));
  } else {
    // === INSIDE A G NODE: show only its members and their internal edges ===
    const memberSet = new Set<string>();
    for (const [mid, gid] of Object.entries(groupMembership)) {
      if (gid === currentGroupId) memberSet.add(mid);
    }
    visibleNodes = nodes.filter((n) => memberSet.has(n.id));
    visibleEdges = edges.filter(
      (e) => memberSet.has(e.source_id) && memberSet.has(e.target_id)
    );
  }

  // Apply type filters
  if (filters.nodeTypes.length > 0) {
    visibleNodes = visibleNodes.filter((n) => filters.nodeTypes.includes(n.type));
  }
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  visibleEdges = visibleEdges.filter(
    (e) => visibleNodeIds.has(e.source_id) && visibleNodeIds.has(e.target_id)
  );

  // Initialize Cytoscape
  const initCy = useCallback(() => {
    if (!containerRef.current || cyRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      style: cytoscapeStyles,
      elements: [],
      layout: { name: 'preset' },
      wheelSensitivity: 0.3,
      minZoom: 0.1,
      maxZoom: 3,
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      selectNode(evt.target.id());
    });

    cy.on('dbltap', 'node', (evt: EventObject) => {
      navigateTo(evt.target.id());
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = edges.find((e) => e.id === evt.target.id());
      if (edge) selectEdge(edge);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        selectNode(null);
        selectEdge(null);
      }
    });

    cy.on('mouseover', 'node', (evt: EventObject) => setHoveredNode(evt.target.id()));
    cy.on('mouseout', 'node', () => setHoveredNode(null));

    cyRef.current = cy;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update elements when data changes
  useEffect(() => {
    if (!cyRef.current) initCy();
    const cy = cyRef.current;
    if (!cy) return;

    const cyNodes = visibleNodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        degree: edges.filter((e) => e.source_id === n.id || e.target_id === n.id).length,
      },
    }));
    const cyEdges = visibleEdges.map((e) => ({
      data: {
        id: e.id,
        source: e.source_id,
        target: e.target_id,
        label: e.label,
        equivalent: e.label === '等价' ? 'true' : 'false',
      },
    }));

    const newIds = new Set(cyNodes.map((n) => n.data.id));
    cy.nodes().forEach((n) => { if (!newIds.has(n.id())) cy.remove(n); });
    const curIds = new Set(cy.nodes().map((n) => n.id()));
    cyNodes.forEach((n) => {
      if (!curIds.has(n.data.id)) cy.add({ group: 'nodes', data: n.data });
      else cy.getElementById(n.data.id).data(n.data);
    });

    const newEdgeIds = new Set(cyEdges.map((e) => e.data.id));
    cy.edges().forEach((e) => { if (!newEdgeIds.has(e.id())) cy.remove(e); });
    const curEdgeIds = new Set(cy.edges().map((e) => e.id()));
    cyEdges.forEach((e) => {
      if (!curEdgeIds.has(e.data.id)) {
        if (cy.getElementById(e.data.source).length && cy.getElementById(e.data.target).length) {
          cy.add({ group: 'edges', data: e.data });
        }
      }
    });

    const lc = layoutConfigs[layout] || layoutConfigs.dagre;
    cy.layout(lc as unknown as cytoscape.LayoutOptions).run();
  }, [visibleNodes, visibleEdges, layout, currentGroupId, initCy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selection highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('dimmed');
    if (selectedNode) {
      const sid = selectedNode.id;
      const nids = new Set<string>();
      cy.getElementById(sid).connectedEdges().forEach((e: any) => {
        nids.add(e.source().id()); nids.add(e.target().id());
      });
      cy.nodes().forEach((n) => { if (n.id() !== sid && !nids.has(n.id())) n.addClass('dimmed'); });
      cy.edges().forEach((e: any) => {
        if (!nids.has(e.source().id()) || !nids.has(e.target().id())) e.addClass('dimmed');
      });
    }
  }, [selectedNode]);

  // Layout changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || cy.nodes().length === 0) return;
    const lc = layoutConfigs[layout] || layoutConfigs.dagre;
    cy.layout(lc as unknown as cytoscape.LayoutOptions).run();
  }, [layout]);

  // Labels toggle
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (showLabels) {
      cy.style().selector('node').style('label', 'data(label)').update();
      cy.style().selector('edge').style('label', 'data(label)').update();
    } else {
      cy.style().selector('node').style('label', '').update();
      cy.style().selector('edge').style('label', '').update();
    }
  }, [showLabels]);

  // Cleanup
  useEffect(() => { return () => { if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; } }; }, []);

  const isEmpty = visibleNodes.length === 0;

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="cytoscape-container" />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-3">🌳</div>
            <p className="text-lg">{currentGroupId ? '此虚顶点内部为空' : '图是空的'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
