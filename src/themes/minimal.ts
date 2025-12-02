import type { Theme } from '../types';

/**
 * Minimal theme - clean black and white with subtle accents
 */
export const minimalTheme: Theme = {
  name: 'minimal',
  colors: {
    primary: '#171717',      // Neutral 900
    secondary: '#525252',    // Neutral 600
    accent: '#404040',       // Neutral 700
    background: '#ffffff',
    surface: '#fafafa',      // Neutral 50
    text: '#171717',         // Neutral 900
    textSecondary: '#737373', // Neutral 500
    border: '#e5e5e5',       // Neutral 200
    success: '#171717',
    warning: '#171717',
    error: '#171717',
  },
  typography: {
    fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
    fontSize: {
      xs: 10,
      sm: 11,
      md: 13,
      lg: 15,
      xl: 18,
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
      stroke: '#171717',
      strokeWidth: 1,
      borderRadius: 0,
    },
    variants: {
      primary: {
        fill: '#171717',
        stroke: '#171717',
        strokeWidth: 1,
      },
      secondary: {
        fill: '#fafafa',
        stroke: '#171717',
        strokeWidth: 1,
      },
      accent: {
        fill: '#f5f5f5',
        stroke: '#171717',
        strokeWidth: 2,
      },
      dashed: {
        fill: '#ffffff',
        stroke: '#171717',
        strokeWidth: 1,
        dashed: true,
      },
    },
  },
  edge: {
    default: {
      stroke: '#171717',
      strokeWidth: 1,
      lineType: 'solid',
    },
    variants: {
      primary: {
        stroke: '#171717',
        strokeWidth: 1,
        lineType: 'solid',
      },
      dashed: {
        stroke: '#171717',
        strokeWidth: 1,
        lineType: 'dashed',
      },
      bold: {
        stroke: '#171717',
        strokeWidth: 2,
        lineType: 'solid',
      },
    },
  },
  text: {
    default: {
      fontFamily: '"SF Mono", monospace',
      fontSize: 13,
      fontWeight: 400,
      color: '#171717',
    },
    variants: {
      title: {
        fontSize: 18,
        fontWeight: 600,
        color: '#171717',
      },
      label: {
        fontSize: 11,
        fontWeight: 500,
        color: '#525252',
      },
      caption: {
        fontSize: 10,
        color: '#737373',
      },
    },
  },
  spacing: {
    nodeNode: 40,
    nodeNodeBetweenLayers: 60,
    edgeNode: 25,
  },
};
