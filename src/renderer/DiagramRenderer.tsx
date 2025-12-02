import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { DiagramModel } from '../core/DiagramModel';
import type { DiagramNode, DiagramGroup } from '../types';
import { BaseNode, BaseNodeData } from './nodes/BaseNode';
import {
  CircleNode,
  DiamondNode,
  HexagonNode,
  CylinderNode,
  CloudNode,
  PersonNode,
  DocumentNode,
  QueueNode,
} from './nodes/ShapeNodes';
import { GroupNode, GroupNodeData } from './nodes/GroupNode';
import { CustomEdge, CustomEdgeData } from './edges/CustomEdge';

// Node type mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = {
  rect: BaseNode as any,
  roundRect: BaseNode as any,
  circle: CircleNode as any,
  ellipse: CircleNode as any,
  diamond: DiamondNode as any,
  hexagon: HexagonNode as any,
  cylinder: CylinderNode as any,
  database: CylinderNode as any,
  cloud: CloudNode as any,
  person: PersonNode as any,
  document: DocumentNode as any,
  queue: QueueNode as any,
  storage: CylinderNode as any,
  folder: DocumentNode as any,
  group: GroupNode as any,
};

// Edge type mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = {
  custom: CustomEdge as any,
};

// Default node dimensions
const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 50;

export interface DiagramRendererProps {
  model: DiagramModel;
  showBackground?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  fitView?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function convertNodeToReactFlow(node: DiagramNode): Node {
  return {
    id: node.id,
    type: node.shape || 'rect',
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.label,
      style: node.style,
      icon: node.icon,
      ports: node.ports,
    } as BaseNodeData,
    parentId: node.parentId,
    extent: node.parentId ? 'parent' : undefined,
    style: {
      width: node.size?.width || DEFAULT_NODE_WIDTH,
      height: node.size?.height || DEFAULT_NODE_HEIGHT,
    },
  };
}

function convertGroupToReactFlow(group: DiagramGroup): Node {
  return {
    id: group.id,
    type: 'group',
    position: group.position || { x: 0, y: 0 },
    data: {
      label: group.label,
      style: group.style,
      width: group.size?.width || 200,
      height: group.size?.height || 150,
    } as GroupNodeData,
    parentId: group.parentId,
    extent: group.parentId ? 'parent' : undefined,
    style: {
      width: group.size?.width || 200,
      height: group.size?.height || 150,
    },
  };
}

function convertEdgeToReactFlow(edge: import('../types').DiagramEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourcePort,
    targetHandle: edge.targetPort,
    type: 'custom',
    data: {
      label: edge.label,
      style: edge.style,
    } as CustomEdgeData,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
    },
    animated: edge.style?.animated,
  };
}

function DiagramRendererInner({
  model,
  showBackground = true,
  showControls = true,
  showMiniMap = false,
  fitView = true,
  className,
  style,
}: DiagramRendererProps) {
  // Convert model to React Flow nodes and edges
  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];

    // Add groups first (they need to be rendered first as parents)
    for (const group of model.groups) {
      nodes.push(convertGroupToReactFlow(group));
    }

    // Add regular nodes
    for (const node of model.nodes) {
      nodes.push(convertNodeToReactFlow(node));
    }

    return nodes;
  }, [model]);

  const initialEdges = useMemo(() => {
    return model.edges.map(convertEdgeToReactFlow);
  }, [model]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={fitView}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        {showBackground && <Background gap={16} size={1} />}
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}

export function DiagramRenderer(props: DiagramRendererProps) {
  return (
    <ReactFlowProvider>
      <DiagramRendererInner {...props} />
    </ReactFlowProvider>
  );
}
