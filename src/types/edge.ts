import type { EdgeStyle } from './style';

/**
 * Edge arrow type
 */
export type ArrowType = 'none' | 'arrow' | 'diamond' | 'circle';

/**
 * Diagram edge definition
 */
export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  style?: EdgeStyle;
  sourceArrow?: ArrowType;
  targetArrow?: ArrowType;
}
