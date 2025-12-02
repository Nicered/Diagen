/**
 * Gradient definition
 */
export interface Gradient {
  type: 'linear' | 'radial';
  from: string;
  to: string;
  angle?: number;
}

/**
 * Shadow definition
 */
export interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

/**
 * Node style properties
 */
export interface NodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  gradient?: Gradient;
  shadow?: Shadow;
  borderRadius?: number;
  opacity?: number;
  dashed?: boolean;
}

/**
 * Edge style properties
 */
export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  lineType?: 'solid' | 'dashed' | 'bold';
  opacity?: number;
  animated?: boolean;
}

/**
 * Text style properties
 */
export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}
