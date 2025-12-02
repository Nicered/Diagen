import type { NodeStyle } from './style';

/**
 * Group/container definition
 */
export interface DiagramGroup {
  id: string;
  label?: string;
  style?: NodeStyle;
  children: string[];
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
