import type { Theme } from '../types';

/**
 * Professional theme - clean blue/gray colors for business presentations
 */
export const professionalTheme: Theme = {
  name: 'professional',
  colors: {
    primary: '#2563eb',      // Blue 600
    secondary: '#64748b',    // Slate 500
    accent: '#0891b2',       // Cyan 600
    background: '#ffffff',
    surface: '#f8fafc',      // Slate 50
    text: '#1e293b',         // Slate 800
    textSecondary: '#64748b', // Slate 500
    border: '#e2e8f0',       // Slate 200
    success: '#16a34a',      // Green 600
    warning: '#ca8a04',      // Yellow 600
    error: '#dc2626',        // Red 600
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
  },
  node: {
    default: {
      fill: '#ffffff',
      stroke: '#e2e8f0',
      strokeWidth: 1,
      borderRadius: 6,
      shadow: {
        offsetX: 0,
        offsetY: 1,
        blur: 3,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    variants: {
      primary: {
        fill: '#2563eb',
        stroke: '#1d4ed8',
        strokeWidth: 1,
      },
      secondary: {
        fill: '#f1f5f9',
        stroke: '#cbd5e1',
        strokeWidth: 1,
      },
      accent: {
        fill: '#0891b2',
        stroke: '#0e7490',
        strokeWidth: 1,
      },
      success: {
        fill: '#dcfce7',
        stroke: '#16a34a',
        strokeWidth: 1,
      },
      warning: {
        fill: '#fef9c3',
        stroke: '#ca8a04',
        strokeWidth: 1,
      },
      error: {
        fill: '#fee2e2',
        stroke: '#dc2626',
        strokeWidth: 1,
      },
    },
  },
  edge: {
    default: {
      stroke: '#475569',      // Slate 600 - darker for better visibility
      strokeWidth: 1.5,
      lineType: 'solid',
    },
    variants: {
      primary: {
        stroke: '#2563eb',
        strokeWidth: 2,
        lineType: 'solid',
      },
      dashed: {
        stroke: '#64748b',    // Slate 500
        strokeWidth: 1.5,
        lineType: 'dashed',
      },
      bold: {
        stroke: '#1e293b',
        strokeWidth: 2.5,
        lineType: 'solid',
      },
    },
  },
  text: {
    default: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
      fontWeight: 400,
      color: '#1e293b',
    },
    variants: {
      title: {
        fontSize: 20,
        fontWeight: 600,
        color: '#0f172a',
      },
      label: {
        fontSize: 12,
        fontWeight: 500,
        color: '#475569',
      },
      caption: {
        fontSize: 10,
        color: '#64748b',
      },
    },
  },
  spacing: {
    nodeNode: 50,
    nodeNodeBetweenLayers: 80,
    edgeNode: 30,
  },
};
