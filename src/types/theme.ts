import type { NodeStyle, EdgeStyle, TextStyle } from './style';

/**
 * Color palette for a theme
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Typography settings
 */
export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
}

/**
 * Theme definition
 */
export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  node: {
    default: NodeStyle;
    variants: Record<string, NodeStyle>;
  };
  edge: {
    default: EdgeStyle;
    variants: Record<string, EdgeStyle>;
  };
  group?: {
    default: NodeStyle;
    variants?: Record<string, NodeStyle>;
  };
  text: {
    default: TextStyle;
    variants: Record<string, TextStyle>;
  };
  spacing: {
    nodeNode: number;
    nodeNodeBetweenLayers: number;
    edgeNode: number;
  };
}
