import type { DiagramModel } from '../core/DiagramModel';
import type { DiagramNode, DiagramEdge, DiagramGroup, NodeStyle } from '../types';

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// Default dimensions
const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 50;
const PADDING = 50;

export interface SvgExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Generate a standalone SVG string from a diagram model
 */
export function exportToSvg(model: DiagramModel, options: SvgExportOptions = {}): string {
  const { backgroundColor = '#ffffff' } = options;

  // Calculate bounds
  const bounds = calculateBounds(model);

  const width = options.width || bounds.width + PADDING * 2;
  const height = options.height || bounds.height + PADDING * 2;

  // Build SVG content
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
`;

  // Add defs for markers and gradients
  svg += generateDefs(model);

  // Background
  if (backgroundColor !== 'transparent') {
    svg += `  <rect width="100%" height="100%" fill="${backgroundColor}"/>
`;
  }

  // Main content group with offset
  const offsetX = PADDING - bounds.minX;
  const offsetY = PADDING - bounds.minY;
  svg += `  <g transform="translate(${offsetX}, ${offsetY})">
`;

  // Render groups first (background)
  for (const group of model.groups) {
    svg += renderGroup(group);
  }

  // Render edges
  for (const edge of model.edges) {
    svg += renderEdge(edge, model);
  }

  // Render nodes
  for (const node of model.nodes) {
    svg += renderNode(node);
  }

  svg += `  </g>
</svg>`;

  return svg;
}

/**
 * Calculate the bounding box of all elements
 */
function calculateBounds(model: DiagramModel): { minX: number; minY: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const updateBounds = (x: number, y: number, w: number, h: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  };

  for (const node of model.nodes) {
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;
    const w = node.size?.width ?? DEFAULT_NODE_WIDTH;
    const h = node.size?.height ?? DEFAULT_NODE_HEIGHT;
    updateBounds(x, y, w, h);
  }

  for (const group of model.groups) {
    const x = group.position?.x ?? 0;
    const y = group.position?.y ?? 0;
    const w = group.size?.width ?? 200;
    const h = group.size?.height ?? 150;
    updateBounds(x, y, w, h);
  }

  // Handle empty diagram
  if (minX === Infinity) {
    return { minX: 0, minY: 0, width: 400, height: 300 };
  }

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Generate SVG defs (markers, gradients, etc.)
 */
function generateDefs(model: DiagramModel): string {
  let defs = `  <defs>
    <!-- Arrow marker -->
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>
`;

  // Generate gradients for nodes that use them
  for (const node of model.nodes) {
    if (node.style?.gradient) {
      const grad = node.style.gradient;
      defs += `    <linearGradient id="gradient-${node.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${grad.from}"/>
      <stop offset="100%" style="stop-color:${grad.to}"/>
    </linearGradient>
`;
    }
  }

  defs += `  </defs>
`;

  return defs;
}

/**
 * Render a group as SVG
 */
function renderGroup(group: DiagramGroup): string {
  const x = group.position?.x ?? 0;
  const y = group.position?.y ?? 0;
  const w = group.size?.width ?? 200;
  const h = group.size?.height ?? 150;
  const style = group.style || {};

  const fill = style.fill ?? 'rgba(240, 240, 240, 0.5)';
  const stroke = style.stroke ?? '#cccccc';
  const strokeWidth = style.strokeWidth ?? 1;
  const rx = style.borderRadius ?? 8;

  let svg = `    <g class="group" id="group-${group.id}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
`;

  if (group.label) {
    svg += `      <text x="${x + 10}" y="${y - 5}" font-size="12" font-family="system-ui, sans-serif" font-weight="500">${escapeXml(group.label)}</text>
`;
  }

  svg += `    </g>
`;

  return svg;
}

/**
 * Render a node as SVG
 */
function renderNode(node: DiagramNode): string {
  const x = node.position?.x ?? 0;
  const y = node.position?.y ?? 0;
  const w = node.size?.width ?? DEFAULT_NODE_WIDTH;
  const h = node.size?.height ?? DEFAULT_NODE_HEIGHT;
  const shape = node.shape ?? 'rect';

  let svg = `    <g class="node" id="node-${node.id}">
`;

  // Render shape
  svg += renderShape(shape, x, y, w, h, node.style, node.id);

  // Render label
  const textX = x + w / 2;
  const textY = y + h / 2;
  svg += `      <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-family="system-ui, sans-serif">${escapeXml(node.label)}</text>
`;

  svg += `    </g>
`;

  return svg;
}

/**
 * Render a shape
 */
function renderShape(
  shape: string,
  x: number,
  y: number,
  w: number,
  h: number,
  style?: NodeStyle,
  nodeId?: string
): string {
  const fill = style?.gradient
    ? `url(#gradient-${nodeId})`
    : style?.fill ?? '#ffffff';
  const stroke = style?.stroke ?? '#e2e8f0';
  const strokeWidth = style?.strokeWidth ?? 1;
  const strokeDasharray = style?.dashed ? '5,5' : undefined;
  const opacity = style?.opacity ?? 1;

  const baseAttrs = `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${
    strokeDasharray ? ` stroke-dasharray="${strokeDasharray}"` : ''
  } opacity="${opacity}"`;

  switch (shape) {
    case 'circle':
    case 'ellipse': {
      const rx = w / 2;
      const ry = h / 2;
      const cx = x + rx;
      const cy = y + ry;
      return `      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${baseAttrs}/>
`;
    }

    case 'diamond': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
      return `      <polygon points="${points}" ${baseAttrs}/>
`;
    }

    case 'hexagon': {
      const offset = w * 0.15;
      const points = `${x + offset},${y} ${x + w - offset},${y} ${x + w},${y + h / 2} ${x + w - offset},${y + h} ${x + offset},${y + h} ${x},${y + h / 2}`;
      return `      <polygon points="${points}" ${baseAttrs}/>
`;
    }

    case 'cylinder':
    case 'database': {
      const ry = h * 0.1;
      return `      <ellipse cx="${x + w / 2}" cy="${y + h - ry}" rx="${w / 2 - 1}" ry="${ry}" ${baseAttrs}/>
      <rect x="${x + 1}" y="${y + ry}" width="${w - 2}" height="${h - 2 * ry}" fill="${fill}" stroke="none"/>
      <line x1="${x + 1}" y1="${y + ry}" x2="${x + 1}" y2="${y + h - ry}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      <line x1="${x + w - 1}" y1="${y + ry}" x2="${x + w - 1}" y2="${y + h - ry}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      <ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2 - 1}" ry="${ry}" ${baseAttrs}/>
`;
    }

    case 'cloud': {
      const path = `M${x + w * 0.2},${y + h * 0.75} a${w * 0.15},${w * 0.15} 0 0,1 0,-${h * 0.5} a${w * 0.2},${w * 0.2} 0 0,1 ${w * 0.35},-${h * 0.15} a${w * 0.25},${w * 0.25} 0 0,1 ${w * 0.4},${h * 0.3} a${w * 0.15},${w * 0.15} 0 0,1 -${w * 0.1},${h * 0.35} Z`;
      return `      <path d="${path}" ${baseAttrs}/>
`;
    }

    case 'roundRect':
    default: {
      const rx = style?.borderRadius ?? 4;
      return `      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${baseAttrs}/>
`;
    }
  }
}

/**
 * Calculate the best connection points between two nodes
 */
function getConnectionPoints(
  sourceNode: DiagramNode,
  targetNode: DiagramNode
): { sx: number; sy: number; tx: number; ty: number; side: 'top' | 'bottom' | 'left' | 'right' } {
  const sw = sourceNode.size?.width ?? DEFAULT_NODE_WIDTH;
  const sh = sourceNode.size?.height ?? DEFAULT_NODE_HEIGHT;
  const tw = targetNode.size?.width ?? DEFAULT_NODE_WIDTH;
  const th = targetNode.size?.height ?? DEFAULT_NODE_HEIGHT;

  const sx0 = sourceNode.position?.x ?? 0;
  const sy0 = sourceNode.position?.y ?? 0;
  const tx0 = targetNode.position?.x ?? 0;
  const ty0 = targetNode.position?.y ?? 0;

  // Center points
  const scx = sx0 + sw / 2;
  const scy = sy0 + sh / 2;
  const tcx = tx0 + tw / 2;
  const tcy = ty0 + th / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  // Determine primary direction
  if (Math.abs(dy) > Math.abs(dx)) {
    // Vertical connection
    if (dy > 0) {
      // Target is below source
      return { sx: scx, sy: sy0 + sh, tx: tcx, ty: ty0, side: 'bottom' };
    } else {
      // Target is above source
      return { sx: scx, sy: sy0, tx: tcx, ty: ty0 + th, side: 'top' };
    }
  } else {
    // Horizontal connection
    if (dx > 0) {
      // Target is to the right
      return { sx: sx0 + sw, sy: scy, tx: tx0, ty: tcy, side: 'right' };
    } else {
      // Target is to the left
      return { sx: sx0, sy: scy, tx: tx0 + tw, ty: tcy, side: 'left' };
    }
  }
}

/**
 * Render an edge as SVG with smooth curves
 */
function renderEdge(edge: DiagramEdge, model: DiagramModel): string {
  const sourceNode = model.getNode(edge.source);
  const targetNode = model.getNode(edge.target);

  if (!sourceNode || !targetNode) {
    return '';
  }

  const { sx, sy, tx, ty, side } = getConnectionPoints(sourceNode, targetNode);

  const style = edge.style || {};
  const stroke = style.stroke ?? '#475569';
  const strokeWidth = style.strokeWidth ?? 1.5;
  let strokeDasharray: string | undefined;

  if (style.lineType === 'dashed') {
    strokeDasharray = '5,5';
  }

  // Create smooth bezier curve based on connection direction
  let path: string;
  const controlOffset = Math.min(Math.abs(tx - sx), Math.abs(ty - sy), 50) + 30;

  if (side === 'bottom' || side === 'top') {
    // Vertical connection - use vertical bezier
    const cy1 = side === 'bottom' ? sy + controlOffset : sy - controlOffset;
    const cy2 = side === 'bottom' ? ty - controlOffset : ty + controlOffset;
    path = `M${sx},${sy} C${sx},${cy1} ${tx},${cy2} ${tx},${ty}`;
  } else {
    // Horizontal connection - use horizontal bezier
    const cx1 = side === 'right' ? sx + controlOffset : sx - controlOffset;
    const cx2 = side === 'right' ? tx - controlOffset : tx + controlOffset;
    path = `M${sx},${sy} C${cx1},${sy} ${cx2},${ty} ${tx},${ty}`;
  }

  let svg = `    <g class="edge" id="edge-${edge.id}">
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"${
    strokeDasharray ? ` stroke-dasharray="${strokeDasharray}"` : ''
  } marker-end="url(#arrowhead)"/>
`;

  if (edge.label) {
    // Place label at the midpoint of the curve
    const labelX = (sx + tx) / 2;
    const labelY = (sy + ty) / 2;
    svg += `      <rect x="${labelX - 20}" y="${labelY - 10}" width="40" height="20" fill="white" stroke="#e0e0e0" rx="4"/>
      <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-family="system-ui, sans-serif">${escapeXml(edge.label)}</text>
`;
  }

  svg += `    </g>
`;

  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Download SVG as a file (browser only)
 */
export function downloadSvg(svgString: string, filename = 'diagram.svg'): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
