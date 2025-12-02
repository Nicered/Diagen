import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeStyle, Port } from '../../types';

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  style?: NodeStyle;
  icon?: string;
  ports?: Port[];
}

const positionMap: Record<string, Position> = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};

function getNodeStyle(style?: NodeStyle): React.CSSProperties {
  const css: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: style?.borderRadius ?? 4,
    backgroundColor: style?.fill ?? '#ffffff',
    border: `${style?.strokeWidth ?? 1}px ${style?.dashed ? 'dashed' : 'solid'} ${style?.stroke ?? '#333333'}`,
    opacity: style?.opacity ?? 1,
    minWidth: 100,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  if (style?.shadow) {
    css.boxShadow = `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`;
  }

  if (style?.gradient) {
    css.background = `linear-gradient(180deg, ${style.gradient.from} 0%, ${style.gradient.to} 100%)`;
  }

  return css;
}

interface BaseNodeProps {
  data: BaseNodeData;
}

export const BaseNode = memo(({ data }: BaseNodeProps) => {
  const style = getNodeStyle(data.style);

  return (
    <div style={style}>
      {/* Default handles */}
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />

      {/* Custom ports */}
      {data.ports?.map((port) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={positionMap[port.position] || Position.Bottom}
          style={{ background: '#555' }}
        />
      ))}

      {/* Icon */}
      {data.icon && <span style={{ marginRight: 8 }}>{data.icon}</span>}

      {/* Label */}
      <span>{data.label}</span>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';
