import ELK, { ElkNode, ElkExtendedEdge, ElkPort } from 'elkjs/lib/elk.bundled.js';
import type { DiagramModel } from '../core/DiagramModel';
import type { DiagramNode, DiagramGroup, DiagramEdge, Direction } from '../types';
import { inferGroupDirection } from './directionInference';

// Default node dimensions
const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 50;
const DEFAULT_GROUP_PADDING = 20;

// Direction mapping
const DIRECTION_MAP: Record<Direction, string> = {
  TB: 'DOWN',
  BT: 'UP',
  LR: 'RIGHT',
  RL: 'LEFT',
};

export interface LayoutOptions {
  algorithm?: string;
  direction?: Direction;
  nodeSpacing?: number;
  layerSpacing?: number;
  edgeRouting?: 'ORTHOGONAL' | 'POLYLINE' | 'SPLINES';
}

const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  algorithm: 'layered',
  direction: 'TB',
  nodeSpacing: 50,
  layerSpacing: 80,
  edgeRouting: 'ORTHOGONAL',
};

/**
 * ELK layout adapter for diagram models
 */
export class ElkLayoutAdapter {
  private elk: InstanceType<typeof ELK>;

  constructor() {
    this.elk = new ELK();
  }

  /**
   * Apply ELK layout to a diagram model
   */
  async layout(model: DiagramModel, options: LayoutOptions = {}): Promise<void> {
    const mergedOptions = { ...DEFAULT_LAYOUT_OPTIONS, ...options };
    const elkGraph = this.modelToElkGraph(model, mergedOptions);

    try {
      const layoutedGraph = await this.elk.layout(elkGraph);
      this.applyLayoutToModel(model, layoutedGraph);
    } catch (error) {
      console.error('ELK layout error:', error);
      throw error;
    }
  }

  /**
   * Convert diagram model to ELK graph format
   */
  private modelToElkGraph(model: DiagramModel, options: LayoutOptions): ElkNode {
    const direction = options.direction || model.direction || 'TB';

    const elkOptions: Record<string, string> = {
      'elk.algorithm': options.algorithm || 'layered',
      'elk.direction': DIRECTION_MAP[direction],
      'elk.spacing.nodeNode': String(options.nodeSpacing ?? 60),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(options.layerSpacing ?? 100),
      'elk.edgeRouting': options.edgeRouting || 'ORTHOGONAL',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.padding': '[top=20,left=20,bottom=20,right=20]',
      // Better edge routing
      'elk.layered.spacing.edgeNodeBetweenLayers': '30',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '20',
      // Optimize node ordering within layers
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      // Center nodes when possible
      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
    };

    // Build root graph
    const rootGraph: ElkNode = {
      id: 'root',
      layoutOptions: elkOptions,
      children: [],
      edges: [],
    };

    // Add groups as compound nodes
    const groupMap = new Map<string, ElkNode>();

    for (const group of model.groups) {
      const elkGroup = this.groupToElkNode(group, model, direction);
      groupMap.set(group.id, elkGroup);

      // Add to parent or root
      if (group.parentId && groupMap.has(group.parentId)) {
        groupMap.get(group.parentId)!.children!.push(elkGroup);
      } else {
        rootGraph.children!.push(elkGroup);
      }
    }

    // Add nodes
    for (const node of model.nodes) {
      const elkNode = this.nodeToElkNode(node);

      // Add to parent group or root
      if (node.parentId && groupMap.has(node.parentId)) {
        groupMap.get(node.parentId)!.children!.push(elkNode);
      } else {
        rootGraph.children!.push(elkNode);
      }
    }

    // Add edges - place them in the appropriate container
    // Build a map of node -> parent group
    const nodeParentMap = new Map<string, string | undefined>();
    for (const node of model.nodes) {
      nodeParentMap.set(node.id, node.parentId);
    }

    for (const edge of model.edges) {
      const elkEdge = this.edgeToElkEdge(edge);
      const sourceParent = nodeParentMap.get(edge.source);
      const targetParent = nodeParentMap.get(edge.target);

      // If both nodes are in the same group, add edge to that group
      if (sourceParent && sourceParent === targetParent && groupMap.has(sourceParent)) {
        const group = groupMap.get(sourceParent)!;
        if (!group.edges) group.edges = [];
        group.edges.push(elkEdge);
      } else {
        // Otherwise add to root
        rootGraph.edges!.push(elkEdge);
      }
    }

    return rootGraph;
  }

  /**
   * Convert a diagram node to ELK node
   */
  private nodeToElkNode(node: DiagramNode): ElkNode {
    const elkNode: ElkNode = {
      id: node.id,
      width: node.size?.width || DEFAULT_NODE_WIDTH,
      height: node.size?.height || DEFAULT_NODE_HEIGHT,
      labels: [{ text: node.label }],
    };

    // Add ports if defined
    if (node.ports && node.ports.length > 0) {
      elkNode.ports = node.ports.map((port) => this.portToElkPort(port, node));
    }

    return elkNode;
  }

  /**
   * Convert a port to ELK port
   */
  private portToElkPort(port: { id: string; position: string; label?: string }, node: DiagramNode): ElkPort {
    const width = node.size?.width || DEFAULT_NODE_WIDTH;
    const height = node.size?.height || DEFAULT_NODE_HEIGHT;

    // Calculate port position based on position property
    let x = 0;
    let y = 0;

    switch (port.position) {
      case 'top':
        x = width / 2;
        y = 0;
        break;
      case 'bottom':
        x = width / 2;
        y = height;
        break;
      case 'left':
        x = 0;
        y = height / 2;
        break;
      case 'right':
        x = width;
        y = height / 2;
        break;
    }

    return {
      id: `${node.id}:${port.id}`,
      x,
      y,
      width: 8,
      height: 8,
    };
  }

  /**
   * Convert a diagram group to ELK compound node
   */
  private groupToElkNode(
    group: DiagramGroup,
    model: DiagramModel,
    globalDirection: Direction
  ): ElkNode {
    // Use explicit direction, or infer from group structure
    const direction = inferGroupDirection(group, model, globalDirection);

    return {
      id: group.id,
      labels: group.label ? [{ text: group.label }] : [],
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': DIRECTION_MAP[direction],
        'elk.padding': `[top=${DEFAULT_GROUP_PADDING + 20},left=${DEFAULT_GROUP_PADDING},bottom=${DEFAULT_GROUP_PADDING},right=${DEFAULT_GROUP_PADDING}]`,
      },
      children: [],
    };
  }

  /**
   * Convert a diagram edge to ELK edge
   */
  private edgeToElkEdge(edge: DiagramEdge): ElkExtendedEdge {
    const elkEdge: ElkExtendedEdge = {
      id: edge.id,
      sources: [edge.sourcePort ? `${edge.source}:${edge.sourcePort}` : edge.source],
      targets: [edge.targetPort ? `${edge.target}:${edge.targetPort}` : edge.target],
    };

    if (edge.label) {
      elkEdge.labels = [{ text: edge.label }];
    }

    return elkEdge;
  }

  /**
   * Apply ELK layout results back to the diagram model
   */
  private applyLayoutToModel(model: DiagramModel, elkGraph: ElkNode): void {
    // Apply positions to all nodes and groups recursively
    this.applyLayoutRecursive(model, elkGraph, 0, 0);
  }

  /**
   * Recursively apply layout to nodes and groups
   */
  private applyLayoutRecursive(
    model: DiagramModel,
    elkNode: ElkNode,
    offsetX: number,
    offsetY: number
  ): void {
    if (elkNode.children) {
      for (const child of elkNode.children) {
        const x = (child.x || 0) + offsetX;
        const y = (child.y || 0) + offsetY;
        const width = child.width || DEFAULT_NODE_WIDTH;
        const height = child.height || DEFAULT_NODE_HEIGHT;

        // Check if this is a node or a group
        const node = model.getNode(child.id);
        if (node) {
          model.updateNode(child.id, {
            position: { x, y },
            size: { width, height },
          });
        }

        const group = model.getGroup(child.id);
        if (group) {
          model.updateGroup(child.id, {
            position: { x, y },
            size: { width, height },
          });

          // Recurse into group children
          this.applyLayoutRecursive(model, child, x, y);
        }
      }
    }
  }

  /**
   * Get available layout algorithms
   */
  getAvailableAlgorithms(): string[] {
    return [
      'layered',     // Hierarchical layouts
      'force',       // Force-directed layouts
      'stress',      // Stress-minimizing layouts
      'mrtree',      // Tree layouts
      'radial',      // Radial layouts
      'box',         // Packing layouts
      'fixed',       // Fixed positioning
      'random',      // Random positioning
    ];
  }
}

export const elkAdapter = new ElkLayoutAdapter();
