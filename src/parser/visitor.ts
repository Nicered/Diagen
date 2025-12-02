import { CstNode } from 'chevrotain';
import { parser } from './parser';
import type {
  DiagramIR,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  DocumentMeta,
  NodeStyle,
  EdgeStyle,
  Gradient,
} from '../types';

// Get the base visitor class
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

// Helper to strip quotes from string literals
function stripQuotes(str: string): string {
  return str.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
}

// Arrow type info
interface ArrowInfo {
  type: 'solid' | 'dashed' | 'bold';
  bidirectional: boolean;
}

function getArrowInfo(arrowToken: { image: string }): ArrowInfo {
  const arrow = arrowToken.image;
  if (arrow === '<=>' || arrow === '==>') {
    return { type: 'bold', bidirectional: arrow === '<=>' };
  }
  if (arrow === '<-->' || arrow === '-->') {
    return { type: 'dashed', bidirectional: arrow === '<-->' };
  }
  return { type: 'solid', bidirectional: arrow === '<->' };
}

interface ParseContext {
  nodes: Map<string, DiagramNode>;
  edges: DiagramEdge[];
  groups: Map<string, DiagramGroup>;
  currentGroupId?: string;
  edgeCounter: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CstContext = Record<string, any>;

class DiagenVisitor extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  document(ctx: CstContext): DiagramIR {
    const header = this.visit(ctx.documentHeader);
    const meta: DocumentMeta = ctx.metaBlock ? this.visit(ctx.metaBlock) : {};

    const parseContext: ParseContext = {
      nodes: new Map(),
      edges: [],
      groups: new Map(),
      edgeCounter: 0,
    };

    if (ctx.body) {
      this.visit(ctx.body, parseContext);
    }

    return {
      type: 'diagram',
      subtype: header.subtype || null,
      meta: { ...meta, ...header.meta },
      content: {
        nodes: Array.from(parseContext.nodes.values()),
        edges: parseContext.edges,
        groups: Array.from(parseContext.groups.values()),
      },
    };
  }

  documentHeader(ctx: CstContext): { type: string; subtype?: string; meta: DocumentMeta } {
    let type = 'diagram';
    let subtype: string | undefined;

    if (ctx.AtDiagram) {
      type = 'diagram';
    } else if (ctx.AtInfographic) {
      type = 'infographic';
    } else if (ctx.AtPage) {
      type = 'page';
    }

    if (ctx.subtype) {
      subtype = ctx.subtype[0].image;
    }

    return { type, subtype, meta: {} };
  }

  metaBlock(ctx: CstContext): DocumentMeta {
    const meta: DocumentMeta = {};
    if (ctx.metaProperty) {
      for (const prop of ctx.metaProperty) {
        const { key, value } = this.visit(prop);
        meta[key] = value;
      }
    }
    return meta;
  }

  metaProperty(ctx: CstContext): { key: string; value: unknown } {
    const key = ctx.key[0].image;
    const value = this.visit(ctx.value);
    return { key, value };
  }

  body(ctx: CstContext, parseContext: ParseContext): void {
    if (ctx.statement) {
      for (const stmt of ctx.statement) {
        this.visit(stmt, parseContext);
      }
    }
  }

  statement(ctx: CstContext, parseContext: ParseContext): void {
    if (ctx.groupDef) {
      this.visit(ctx.groupDef, parseContext);
    } else if (ctx.nodeOrEdgeStatement) {
      this.visit(ctx.nodeOrEdgeStatement, parseContext);
    } else if (ctx.elementDef) {
      this.visit(ctx.elementDef, parseContext);
    }
  }

  emptyLine(): void {
    // No-op
  }

  nodeOrEdgeStatement(ctx: CstContext, parseContext: ParseContext): void {
    // In edge context, we need to resolve group references
    const isEdgeContext = !!ctx.edgeChain;

    if (isEdgeContext) {
      // Use edge-aware visitor that resolves group references
      const leftNodeResult = this.visitNodeSetForEdge(ctx.nodeSet[0], parseContext);
      const leftNodes = leftNodeResult.nodes;

      // Pass parseContext directly to preserve edgeCounter reference
      // Add leftNodes as a property on the same context
      (parseContext as ParseContext & { leftNodes: string[] }).leftNodes = leftNodes;
      this.visit(ctx.edgeChain, parseContext as ParseContext & { leftNodes: string[] });
    } else {
      // Simple node definition without edges
      this.visit(ctx.nodeSet, parseContext);
    }
  }

  edgeChain(ctx: CstContext, parseContext: ParseContext & { leftNodes: string[] }): void {
    let currentSources = parseContext.leftNodes;

    const arrowOps = ctx.arrowOp || [];
    const nodeSets = ctx.nodeSet || [];

    for (let i = 0; i < arrowOps.length; i++) {
      const arrowInfo = this.visit(arrowOps[i]);

      // Visit nodeSet and extract edge label if present
      // When nodeSet contains a nodeDef with a label, we may need to treat it as edge label
      const nodeSetResult = this.visitNodeSetForEdge(nodeSets[i], parseContext);
      const targetNodes = nodeSetResult.nodes;
      const label = nodeSetResult.edgeLabel;

      // Create edges for all source-target combinations
      for (const source of currentSources) {
        for (const target of targetNodes) {
          const edge: DiagramEdge = {
            id: `e${++parseContext.edgeCounter}`,
            source: source.split(':')[0],
            target: target.split(':')[0],
            label,
            style: this.getEdgeStyle(arrowInfo),
          };

          // Handle port references
          if (source.includes(':')) {
            edge.sourcePort = source.split(':')[1];
          }
          if (target.includes(':')) {
            edge.targetPort = target.split(':')[1];
          }

          parseContext.edges.push(edge);
        }
      }

      currentSources = targetNodes;
    }
  }

  // Special visitor for nodeSet in edge chain context
  // Returns nodes and extracts edge label if the last node has a label
  private visitNodeSetForEdge(
    nodeSetCst: CstNode,
    parseContext: ParseContext
  ): { nodes: string[]; edgeLabel?: string } {
    const ctx = nodeSetCst.children as CstContext;

    if (ctx.LParen) {
      // Multiple nodes: (A, B, C) - no edge label in this case
      const nodeRefs = ctx.nodeRef || [];
      const nodes = nodeRefs.map((ref: CstNode) => this.visit(ref, parseContext));
      // Resolve group references for each node
      return { nodes: nodes.map((n: string) => this.resolveNodeId(n, parseContext)) };
    } else {
      // Single node definition - check for edge label
      const nodeDefCst = ctx.nodeDef[0];
      const nodeDefCtx = nodeDefCst.children as CstContext;

      const nodeId = nodeDefCtx.nodeId[0].image;
      let fullId = nodeId;
      if (nodeDefCtx.nestedId) {
        for (const nested of nodeDefCtx.nestedId) {
          fullId += '.' + nested.image;
        }
      }

      // Check if this is a port reference
      if (nodeDefCtx.portId) {
        const resolvedId = this.resolveNodeId(fullId, parseContext);
        return { nodes: [resolvedId + ':' + nodeDefCtx.portId[0].image] };
      }

      // Check if there's a label - in edge context, this becomes edge label
      let edgeLabel: string | undefined;
      if (nodeDefCtx.label) {
        edgeLabel = stripQuotes(nodeDefCtx.label[0].image);
      }

      // Resolve group reference (e.g., Backend.API -> API if API exists in Backend group)
      const resolvedId = this.resolveNodeId(fullId, parseContext);

      // Get attributes
      const attrs = nodeDefCtx.attributes ? this.visit(nodeDefCtx.attributes) : {};

      // Only create new node if:
      // 1. Node doesn't exist AND
      // 2. This is not a resolved group reference (resolvedId === fullId means no resolution happened)
      if (!parseContext.nodes.has(resolvedId) && resolvedId === fullId) {
        const node: DiagramNode = {
          id: fullId,
          label: fullId, // Use ID as label when in edge context
          shape: attrs.shape || 'rect',
          style: this.buildNodeStyle(attrs),
          parentId: parseContext.currentGroupId,
        };

        if (attrs.icon) {
          node.icon = attrs.icon;
        }
        if (attrs.ports) {
          node.ports = attrs.ports;
        }

        parseContext.nodes.set(fullId, node);
      }

      return { nodes: [resolvedId], edgeLabel };
    }
  }

  // Resolve group reference like Backend.API to the actual node ID (API)
  // Returns the original ID if not a group reference or node not found in group
  private resolveNodeId(fullId: string, parseContext: ParseContext): string {
    // Check if this looks like a group reference (contains a dot)
    if (!fullId.includes('.')) {
      return fullId;
    }

    const parts = fullId.split('.');
    if (parts.length === 2) {
      const [groupId, nodeId] = parts;
      // Check if there's a group with this ID
      if (parseContext.groups.has(groupId)) {
        // Check if node exists in that group
        if (parseContext.nodes.has(nodeId)) {
          const node = parseContext.nodes.get(nodeId)!;
          if (node.parentId === groupId) {
            return nodeId;
          }
        }
      }
    }

    // For deeper nesting like A.B.C, try to resolve iteratively
    // For now, return the original ID
    return fullId;
  }

  private getEdgeStyle(arrowInfo: ArrowInfo): EdgeStyle {
    return {
      lineType: arrowInfo.type,
    };
  }

  arrowOp(ctx: CstContext): ArrowInfo {
    const token = ctx.BoldBiArrow?.[0] ||
      ctx.BoldArrow?.[0] ||
      ctx.DashedBiArrow?.[0] ||
      ctx.DashedArrow?.[0] ||
      ctx.BiArrow?.[0] ||
      ctx.Arrow?.[0];
    return getArrowInfo(token!);
  }

  nodeSet(ctx: CstContext, parseContext: ParseContext): string[] {
    if (ctx.LParen) {
      // Multiple nodes: (A, B, C)
      const nodeRefs = ctx.nodeRef || [];
      return nodeRefs.map((ref: CstNode) => this.visit(ref, parseContext));
    } else {
      // Single node definition
      const nodeDef = this.visit(ctx.nodeDef, parseContext);
      return [nodeDef];
    }
  }

  nodeRef(ctx: CstContext, _parseContext: ParseContext): string {
    const parts = [ctx.nodeId[0].image];

    if (ctx.nestedId) {
      for (const nested of ctx.nestedId) {
        parts.push(nested.image);
      }
    }

    let fullId = parts.join('.');

    if (ctx.portId) {
      fullId += ':' + ctx.portId[0].image;
    }

    return fullId;
  }

  nodeDef(ctx: CstContext, parseContext: ParseContext): string {
    const nodeId = ctx.nodeId[0].image;

    // Build full ID with nested parts
    let fullId = nodeId;
    if (ctx.nestedId) {
      for (const nested of ctx.nestedId) {
        fullId += '.' + nested.image;
      }
    }

    // Check if this is a port reference
    if (ctx.portId) {
      return fullId + ':' + ctx.portId[0].image;
    }

    // Get label (either from string literal or use ID as label)
    const label = ctx.label
      ? stripQuotes(ctx.label[0].image)
      : nodeId;

    // Get attributes
    const attrs = ctx.attributes ? this.visit(ctx.attributes) : {};

    // Create node if it doesn't exist
    if (!parseContext.nodes.has(fullId)) {
      const node: DiagramNode = {
        id: fullId,
        label,
        shape: attrs.shape || 'rect',
        style: this.buildNodeStyle(attrs),
        parentId: parseContext.currentGroupId,
      };

      if (attrs.icon) {
        node.icon = attrs.icon;
      }

      if (attrs.ports) {
        node.ports = attrs.ports;
      }

      parseContext.nodes.set(fullId, node);
    }

    return fullId;
  }

  private buildNodeStyle(attrs: Record<string, unknown>): NodeStyle {
    const style: NodeStyle = {};

    if (attrs.fill) style.fill = attrs.fill as string;
    if (attrs.stroke) style.stroke = attrs.stroke as string;
    if (attrs.strokeWidth) style.strokeWidth = attrs.strokeWidth as number;
    if (attrs.opacity) style.opacity = attrs.opacity as number;
    if (attrs.dashed) style.dashed = attrs.dashed as boolean;
    if (attrs.shadow) style.shadow = { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.2)' };
    if (attrs.gradient) style.gradient = attrs.gradient as Gradient;

    return style;
  }

  attributes(ctx: CstContext): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};

    if (ctx.attribute) {
      for (const attr of ctx.attribute) {
        const { name, value } = this.visit(attr);
        // Handle shorthand shape names (e.g., [cylinder] means shape: cylinder)
        if (value === undefined) {
          attrs.shape = name;
        } else {
          attrs[name] = value;
        }
      }
    }

    return attrs;
  }

  attribute(ctx: CstContext): { name: string; value: unknown } {
    const name = ctx.attrName[0].image;
    const value = ctx.value ? this.visit(ctx.value) : undefined;
    return { name, value };
  }

  groupDef(ctx: CstContext, parseContext: ParseContext): void {
    const groupId = ctx.groupId[0].image;
    const attrs = ctx.attributes ? this.visit(ctx.attributes) : {};

    const group: DiagramGroup = {
      id: groupId,
      label: attrs.label || groupId,
      style: this.buildNodeStyle(attrs),
      children: [],
      parentId: parseContext.currentGroupId,
      direction: attrs.direction as 'TB' | 'BT' | 'LR' | 'RL' | undefined,
    };

    parseContext.groups.set(groupId, group);

    // Process body with this group as parent
    const previousGroupId = parseContext.currentGroupId;
    parseContext.currentGroupId = groupId;

    if (ctx.body) {
      this.visit(ctx.body, parseContext);
    }

    // Collect children
    for (const node of parseContext.nodes.values()) {
      if (node.parentId === groupId) {
        group.children.push(node.id);
      }
    }

    parseContext.currentGroupId = previousGroupId;
  }

  placeDef(ctx: CstContext, _parseContext: ParseContext): void {
    // For page layouts - to be implemented
    const position = this.visit(ctx.position);
    const document = this.visit(ctx.document);
    console.log('Place:', position, document);
  }

  position(ctx: CstContext): { x: number; y: number; width: number; height: number } {
    return {
      x: parseFloat(ctx.x[0].image),
      y: parseFloat(ctx.y[0].image),
      width: parseFloat(ctx.width[0].image),
      height: parseFloat(ctx.height[0].image),
    };
  }

  elementDef(ctx: CstContext, _parseContext: ParseContext): void {
    // For infographic elements - to be implemented in Phase 2
    const keyword = this.visit(ctx.elementKeyword);
    const elementId = stripQuotes(ctx.elementId[0].image);
    const attrs = ctx.attributes ? this.visit(ctx.attributes) : {};
    console.log('Element:', keyword, elementId, attrs);
  }

  elementKeyword(ctx: CstContext): string {
    const keywords = [
      'Item', 'Data', 'Series', 'Point', 'Step', 'Stage', 'Level',
      'Cell', 'Ring', 'Layer', 'Phase', 'Member', 'Actor', 'System',
      'Container', 'Component', 'Source', 'Transform', 'Sink',
      'Region', 'Vpc', 'Subnet', 'Resource', 'External', 'NLayer',
    ];

    for (const kw of keywords) {
      if (ctx[kw]) {
        return kw.toLowerCase();
      }
    }

    return 'unknown';
  }

  elementBlock(ctx: CstContext, _parseContext: ParseContext): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    if (ctx.blockProperty) {
      for (const prop of ctx.blockProperty) {
        const { key, value } = this.visit(prop);
        props[key] = value;
      }
    }

    return props;
  }

  blockProperty(ctx: CstContext): { key: string; value: unknown } {
    const keyToken = ctx.key[0];
    const key = keyToken.image.startsWith('"')
      ? stripQuotes(keyToken.image)
      : keyToken.image;
    const value = this.visit(ctx.value);
    return { key, value };
  }

  value(ctx: CstContext): unknown {
    if (ctx.StringLiteral) {
      return stripQuotes(ctx.StringLiteral[0].image);
    }
    if (ctx.NumberLiteral) {
      return parseFloat(ctx.NumberLiteral[0].image);
    }
    if (ctx.True) {
      return true;
    }
    if (ctx.False) {
      return false;
    }
    if (ctx.Color) {
      return ctx.Color[0].image;
    }
    if (ctx.Percent) {
      const percentStr = ctx.Percent[0].image;
      return { type: 'percent', value: parseInt(percentStr) };
    }
    if (ctx.gradient) {
      return this.visit(ctx.gradient);
    }
    if (ctx.array) {
      return this.visit(ctx.array);
    }
    if (ctx.Identifier) {
      return ctx.Identifier[0].image;
    }
    return null;
  }

  gradient(ctx: CstContext): Gradient {
    return {
      type: 'linear',
      from: ctx.fromColor[0].image,
      to: ctx.toColor[0].image,
    };
  }

  array(ctx: CstContext): unknown[] {
    if (!ctx.arrayItem) {
      return [];
    }
    return ctx.arrayItem.map((item: CstNode) => this.visit(item));
  }

  arrayItem(ctx: CstContext): unknown {
    const value = this.visit(ctx.value);
    if (ctx.attributes) {
      const attrs = this.visit(ctx.attributes);
      return { value, ...attrs };
    }
    return value;
  }
}

export const visitor = new DiagenVisitor();
