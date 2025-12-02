// IR validation

import type { DiagramIR, DiagramNode, DiagramGroup } from '../types';
import { ValidationError, CompileWarning, ErrorCodes, createWarning } from './errors';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: CompileWarning[];
}

export function validate(ir: DiagramIR): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: CompileWarning[] = [];

  const { nodes, edges, groups } = ir.content;

  // 1. Check for duplicate node IDs
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(
        new ValidationError(
          ErrorCodes.DUPLICATE_ID,
          `Duplicate node ID: "${node.id}"`
        )
      );
    }
    nodeIds.add(node.id);
  }

  // 2. Check for duplicate group IDs
  const groupIds = new Set<string>();
  for (const group of groups) {
    if (groupIds.has(group.id)) {
      errors.push(
        new ValidationError(
          ErrorCodes.DUPLICATE_ID,
          `Duplicate group ID: "${group.id}"`
        )
      );
    }
    if (nodeIds.has(group.id)) {
      errors.push(
        new ValidationError(
          ErrorCodes.DUPLICATE_ID,
          `Group ID "${group.id}" conflicts with node ID`
        )
      );
    }
    groupIds.add(group.id);
  }

  // 3. Collect all defined IDs
  const allIds = new Set([...nodeIds, ...groupIds]);

  // 4. Check edge references
  const referencedIds = new Set<string>();
  for (const edge of edges) {
    referencedIds.add(edge.source);
    referencedIds.add(edge.target);

    // Check if source/target exist (warning, not error - we auto-create)
    if (!allIds.has(edge.source)) {
      warnings.push(
        createWarning(
          'DIAGEN-W001',
          `Node "${edge.source}" is referenced but not defined (will be auto-created)`,
          edge.source
        )
      );
    }
    if (!allIds.has(edge.target)) {
      warnings.push(
        createWarning(
          'DIAGEN-W001',
          `Node "${edge.target}" is referenced but not defined (will be auto-created)`,
          edge.target
        )
      );
    }
  }

  // 5. Check for unused nodes (warning only)
  for (const nodeId of nodeIds) {
    if (!referencedIds.has(nodeId)) {
      const node = nodes.find((n: DiagramNode) => n.id === nodeId);
      const isInGroup = node?.parentId;
      if (!isInGroup) {
        // Only warn for top-level unused nodes
        warnings.push(
          createWarning(
            'DIAGEN-W002',
            `Node "${nodeId}" is defined but never referenced in any edge`,
            nodeId
          )
        );
      }
    }
  }

  // 6. Check for circular group references
  const circularCheck = checkCircularGroups(groups);
  if (circularCheck) {
    errors.push(
      new ValidationError(
        ErrorCodes.CIRCULAR_GROUP,
        `Circular group reference detected: ${circularCheck.join(' -> ')}`
      )
    );
  }

  // 7. Check group parent references
  for (const group of groups) {
    if (group.parentId && !groupIds.has(group.parentId)) {
      errors.push(
        new ValidationError(
          ErrorCodes.UNDEFINED_NODE_REF,
          `Group "${group.id}" references undefined parent group "${group.parentId}"`
        )
      );
    }
  }

  // 8. Check node parent references
  for (const node of nodes) {
    if (node.parentId && !groupIds.has(node.parentId)) {
      errors.push(
        new ValidationError(
          ErrorCodes.UNDEFINED_NODE_REF,
          `Node "${node.id}" references undefined parent group "${node.parentId}"`
        )
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function checkCircularGroups(groups: DiagramGroup[]): string[] | null {
  const parentMap = new Map<string, string>();
  for (const group of groups) {
    if (group.parentId) {
      parentMap.set(group.id, group.parentId);
    }
  }

  for (const group of groups) {
    const visited = new Set<string>();
    let current: string | undefined = group.id;

    while (current) {
      if (visited.has(current)) {
        // Found a cycle - reconstruct path
        const path: string[] = [];
        let node: string | undefined = group.id;
        while (node && !path.includes(node)) {
          path.push(node);
          node = parentMap.get(node);
        }
        if (node) path.push(node);
        return path;
      }
      visited.add(current);
      current = parentMap.get(current);
    }
  }

  return null;
}
