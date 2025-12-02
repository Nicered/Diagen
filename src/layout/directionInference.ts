import type { DiagramModel } from '../core/DiagramModel';
import type { DiagramGroup, Direction } from '../types';

/**
 * Infer optimal layout direction for a group based on its internal structure
 */
export function inferGroupDirection(
  group: DiagramGroup,
  model: DiagramModel,
  globalDirection: Direction
): Direction {
  // If direction is explicitly set, use it
  if (group.direction) {
    return group.direction;
  }

  const childIds = new Set(group.children);

  // Find edges within this group (both source and target are children)
  const internalEdges = model.edges.filter(
    (edge) => childIds.has(edge.source) && childIds.has(edge.target)
  );

  // No internal edges - use horizontal layout for independent nodes
  if (internalEdges.length === 0) {
    return 'LR';
  }

  // Analyze connection pattern
  const outDegree = new Map<string, number>();
  const inDegree = new Map<string, number>();

  for (const nodeId of childIds) {
    outDegree.set(nodeId, 0);
    inDegree.set(nodeId, 0);
  }

  for (const edge of internalEdges) {
    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Check for fan-out pattern (one node connects to multiple)
  const hasFanOut = Array.from(outDegree.values()).some((deg) => deg > 1);

  // Check for fan-in pattern (multiple nodes connect to one)
  const hasFanIn = Array.from(inDegree.values()).some((deg) => deg > 1);

  // Check if it's a simple chain (each node has at most 1 in and 1 out)
  const isChain =
    !hasFanOut &&
    !hasFanIn &&
    internalEdges.length === childIds.size - 1;

  if (isChain) {
    // For chains, use horizontal layout to save vertical space
    return 'LR';
  }

  if (hasFanOut || hasFanIn) {
    // For fan patterns, horizontal layout often looks cleaner
    return 'LR';
  }

  // Default: follow global direction
  return globalDirection;
}

/**
 * Apply inferred directions to all groups in the model
 */
export function inferAllGroupDirections(
  model: DiagramModel,
  globalDirection: Direction
): Map<string, Direction> {
  const directions = new Map<string, Direction>();

  for (const group of model.groups) {
    const direction = inferGroupDirection(group, model, globalDirection);
    directions.set(group.id, direction);
  }

  return directions;
}
