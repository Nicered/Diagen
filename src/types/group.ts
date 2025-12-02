import type { NodeStyle } from './style';
import type { Direction } from './ir';

/**
 * Group/container definition
 */
export interface DiagramGroup {
  id: string;
  label?: string;
  style?: NodeStyle;
  children: string[];
  parentId?: string;
  direction?: Direction;  // Layout direction for children within this group
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}
