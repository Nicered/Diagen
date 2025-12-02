// Theme application to IR

import type {
  DiagramIR,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  Theme,
  NodeStyle,
  EdgeStyle,
} from '../types';
import { themes } from '../themes';

export interface ThemeApplierOptions {
  theme?: Theme | string;
  defaultNodeStyle?: Partial<NodeStyle>;
  defaultEdgeStyle?: Partial<EdgeStyle>;
}

export function applyTheme(
  ir: DiagramIR,
  options?: ThemeApplierOptions
): DiagramIR {
  const theme = resolveTheme(options?.theme);

  return {
    ...ir,
    content: {
      nodes: ir.content.nodes.map((node: DiagramNode) =>
        applyNodeTheme(node, theme, options?.defaultNodeStyle)
      ),
      edges: ir.content.edges.map((edge: DiagramEdge) =>
        applyEdgeTheme(edge, theme, options?.defaultEdgeStyle)
      ),
      groups: ir.content.groups.map((group: DiagramGroup) =>
        applyGroupTheme(group, theme)
      ),
    },
  };
}

function resolveTheme(themeOrName?: Theme | string): Theme {
  if (!themeOrName) {
    return themes.professional;
  }

  if (typeof themeOrName === 'string') {
    const theme = themes[themeOrName as keyof typeof themes];
    if (!theme) {
      console.warn(`Theme "${themeOrName}" not found, using professional theme`);
      return themes.professional;
    }
    return theme;
  }

  return themeOrName;
}

function applyNodeTheme(
  node: DiagramNode,
  theme: Theme,
  defaultStyle?: Partial<NodeStyle>
): DiagramNode {
  // Priority: inline style > variant style > default style > theme default
  const themeDefault = theme.node.default;
  const variantStyle = node.shape ? theme.node.variants?.[node.shape] : undefined;

  const mergedStyle: NodeStyle = {
    ...themeDefault,
    ...variantStyle,
    ...defaultStyle,
    ...node.style,
  };

  return {
    ...node,
    style: mergedStyle,
  };
}

function applyEdgeTheme(
  edge: DiagramEdge,
  theme: Theme,
  defaultStyle?: Partial<EdgeStyle>
): DiagramEdge {
  const themeDefault = theme.edge.default;
  const lineType = edge.style?.lineType;
  const variantStyle = lineType ? theme.edge.variants?.[lineType] : undefined;

  const mergedStyle: EdgeStyle = {
    ...themeDefault,
    ...variantStyle,
    ...defaultStyle,
    ...edge.style,
  };

  return {
    ...edge,
    style: mergedStyle,
  };
}

function applyGroupTheme(group: DiagramGroup, theme: Theme): DiagramGroup {
  const themeDefault = theme.group?.default ?? {
    fill: 'rgba(240, 240, 240, 0.5)',
    stroke: '#cccccc',
    strokeWidth: 1,
    borderRadius: 8,
  };

  const mergedStyle: NodeStyle = {
    ...themeDefault,
    ...group.style,
  };

  return {
    ...group,
    style: mergedStyle,
  };
}

// Utility to merge styles
export function mergeStyles<T extends Record<string, unknown>>(
  ...styles: (Partial<T> | undefined)[]
): T {
  const result: Record<string, unknown> = {};

  for (const style of styles) {
    if (style) {
      Object.assign(result, style);

      // Deep merge for nested objects
      if ('shadow' in style && style.shadow) {
        result.shadow = { ...(result.shadow as object ?? {}), ...(style.shadow as object) };
      }
      if ('gradient' in style && style.gradient) {
        result.gradient = { ...(result.gradient as object ?? {}), ...(style.gradient as object) };
      }
    }
  }

  return result as T;
}
