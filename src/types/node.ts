import type { NodeStyle } from './style';

/**
 * Available node shapes
 */
export type NodeShape =
  | 'rect'
  | 'roundRect'
  | 'circle'
  | 'ellipse'
  | 'diamond'
  | 'hexagon'
  | 'octagon'
  | 'parallelogram'
  | 'cylinder'
  | 'cloud'
  | 'person'
  | 'document'
  | 'queue'
  | 'storage'
  | 'database'
  | 'folder';

/**
 * Port position on a node
 */
export type PortPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Port definition for a node
 */
export interface Port {
  id: string;
  position: PortPosition;
  label?: string;
}

/**
 * Diagram node definition
 */
export interface DiagramNode {
  id: string;
  label: string;
  shape?: NodeShape;
  style?: NodeStyle;
  ports?: Port[];
  icon?: string;
  parentId?: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}
