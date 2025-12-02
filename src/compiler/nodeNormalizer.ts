// Node normalization - handles implicit node creation

import type { DiagramIR, DiagramNode, NodeShape } from '../types';

export interface NormalizerOptions {
  autoCreateNodes?: boolean;
  defaultShape?: NodeShape;
}

export function normalizeNodes(
  ir: DiagramIR,
  options: NormalizerOptions = {}
): DiagramIR {
  const { autoCreateNodes = true, defaultShape = 'rect' } = options;

  if (!autoCreateNodes) {
    return ir;
  }

  const { nodes, edges, groups } = ir.content;

  // Collect all defined node IDs
  const definedNodeIds = new Set(nodes.map((n: DiagramNode) => n.id));
  const definedGroupIds = new Set(groups.map((g) => g.id));
  const allDefinedIds = new Set([...definedNodeIds, ...definedGroupIds]);

  // Collect all referenced IDs from edges
  const referencedIds = new Set<string>();
  for (const edge of edges) {
    // Handle dotted references (e.g., "Group.Node")
    const sourceBase = edge.source.split('.')[0];
    const targetBase = edge.target.split('.')[0];
    referencedIds.add(sourceBase);
    referencedIds.add(targetBase);
  }

  // Find IDs that are referenced but not defined
  const implicitNodeIds: string[] = [];
  for (const id of referencedIds) {
    if (!allDefinedIds.has(id)) {
      implicitNodeIds.push(id);
    }
  }

  // Create implicit nodes
  const implicitNodes: DiagramNode[] = implicitNodeIds.map(id => ({
    id,
    label: id, // Use ID as label
    shape: defaultShape,
  }));

  return {
    ...ir,
    content: {
      ...ir.content,
      nodes: [...nodes, ...implicitNodes],
    },
  };
}

// Resolve dotted references (e.g., "Backend.API" -> "API")
export function resolveNodeReference(ref: string): { groupPath: string[]; nodeId: string } {
  const parts = ref.split('.');
  if (parts.length === 1) {
    return { groupPath: [], nodeId: parts[0] };
  }
  return {
    groupPath: parts.slice(0, -1),
    nodeId: parts[parts.length - 1],
  };
}

// Extract port from reference (e.g., "Node:port" -> { nodeId: "Node", portId: "port" })
export function parsePortReference(ref: string): { nodeId: string; portId?: string } {
  const [nodeId, portId] = ref.split(':');
  return { nodeId, portId };
}
