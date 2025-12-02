import type { Theme, NodeStyle, EdgeStyle } from '../types';
import { professionalTheme } from './professional';
import { modernTheme } from './modern';
import { minimalTheme } from './minimal';

export { professionalTheme } from './professional';
export { modernTheme } from './modern';
export { minimalTheme } from './minimal';

/**
 * All available themes
 */
export const themes: Record<string, Theme> = {
  professional: professionalTheme,
  modern: modernTheme,
  minimal: minimalTheme,
};

/**
 * Get a theme by name
 */
export function getTheme(name: string): Theme {
  const theme = themes[name];
  if (!theme) {
    console.warn(`Theme "${name}" not found, falling back to "professional"`);
    return professionalTheme;
  }
  return theme;
}

/**
 * Apply theme to node style
 */
export function applyThemeToNode(
  theme: Theme,
  variant?: string
): NodeStyle {
  if (variant && theme.node.variants[variant]) {
    return {
      ...theme.node.default,
      ...theme.node.variants[variant],
    };
  }
  return theme.node.default;
}

/**
 * Apply theme to edge style
 */
export function applyThemeToEdge(
  theme: Theme,
  variant?: string
): EdgeStyle {
  if (variant && theme.edge.variants[variant]) {
    return {
      ...theme.edge.default,
      ...theme.edge.variants[variant],
    };
  }
  return theme.edge.default;
}

/**
 * Create a custom theme by extending an existing theme
 */
export function createTheme(
  name: string,
  baseTheme: Theme,
  overrides: Partial<Theme>
): Theme {
  return {
    ...baseTheme,
    ...overrides,
    name,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
      fontSize: {
        ...baseTheme.typography.fontSize,
        ...overrides.typography?.fontSize,
      },
      fontWeight: {
        ...baseTheme.typography.fontWeight,
        ...overrides.typography?.fontWeight,
      },
    },
    node: {
      default: {
        ...baseTheme.node.default,
        ...overrides.node?.default,
      },
      variants: {
        ...baseTheme.node.variants,
        ...overrides.node?.variants,
      },
    },
    edge: {
      default: {
        ...baseTheme.edge.default,
        ...overrides.edge?.default,
      },
      variants: {
        ...baseTheme.edge.variants,
        ...overrides.edge?.variants,
      },
    },
    text: {
      default: {
        ...baseTheme.text.default,
        ...overrides.text?.default,
      },
      variants: {
        ...baseTheme.text.variants,
        ...overrides.text?.variants,
      },
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing,
    },
  };
}
