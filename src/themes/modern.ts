import type { Theme } from '../types';

/**
 * Modern theme - vibrant gradients and contemporary design
 */
export const modernTheme: Theme = {
  name: 'modern',
  colors: {
    primary: '#8b5cf6',      // Violet 500
    secondary: '#ec4899',    // Pink 500
    accent: '#06b6d4',       // Cyan 500
    background: '#fafafa',
    surface: '#ffffff',
    text: '#18181b',         // Zinc 900
    textSecondary: '#71717a', // Zinc 500
    border: '#e4e4e7',       // Zinc 200
    success: '#22c55e',      // Green 500
    warning: '#f59e0b',      // Amber 500
    error: '#ef4444',        // Red 500
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 18,
      xl: 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  node: {
    default: {
      fill: '#ffffff',
      stroke: '#e4e4e7',
      strokeWidth: 1,
      borderRadius: 12,
      shadow: {
        offsetX: 0,
        offsetY: 4,
        blur: 12,
        color: 'rgba(0, 0, 0, 0.08)',
      },
    },
    variants: {
      primary: {
        gradient: {
          type: 'linear',
          from: '#8b5cf6',
          to: '#6366f1',
        },
        stroke: '#7c3aed',
        strokeWidth: 0,
      },
      secondary: {
        gradient: {
          type: 'linear',
          from: '#ec4899',
          to: '#f43f5e',
        },
        stroke: '#db2777',
        strokeWidth: 0,
      },
      accent: {
        gradient: {
          type: 'linear',
          from: '#06b6d4',
          to: '#0ea5e9',
        },
        stroke: '#0891b2',
        strokeWidth: 0,
      },
      success: {
        gradient: {
          type: 'linear',
          from: '#22c55e',
          to: '#10b981',
        },
        strokeWidth: 0,
      },
      warning: {
        gradient: {
          type: 'linear',
          from: '#f59e0b',
          to: '#f97316',
        },
        strokeWidth: 0,
      },
      error: {
        gradient: {
          type: 'linear',
          from: '#ef4444',
          to: '#dc2626',
        },
        strokeWidth: 0,
      },
      glass: {
        fill: 'rgba(255, 255, 255, 0.7)',
        stroke: 'rgba(255, 255, 255, 0.3)',
        strokeWidth: 1,
        opacity: 0.9,
      },
    },
  },
  edge: {
    default: {
      stroke: '#52525b',      // Zinc 600 - darker
      strokeWidth: 1.5,
      lineType: 'solid',
    },
    variants: {
      primary: {
        stroke: '#8b5cf6',
        strokeWidth: 2,
        lineType: 'solid',
      },
      dashed: {
        stroke: '#a1a1aa',
        strokeWidth: 1.5,
        lineType: 'dashed',
      },
      bold: {
        stroke: '#18181b',
        strokeWidth: 3,
        lineType: 'solid',
      },
      animated: {
        stroke: '#8b5cf6',
        strokeWidth: 2,
        lineType: 'solid',
        animated: true,
      },
    },
  },
  text: {
    default: {
      fontFamily: '"Inter", sans-serif',
      fontSize: 14,
      fontWeight: 400,
      color: '#18181b',
    },
    variants: {
      title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#09090b',
      },
      label: {
        fontSize: 12,
        fontWeight: 500,
        color: '#52525b',
      },
      caption: {
        fontSize: 10,
        color: '#71717a',
      },
    },
  },
  spacing: {
    nodeNode: 60,
    nodeNodeBetweenLayers: 100,
    edgeNode: 40,
  },
};
