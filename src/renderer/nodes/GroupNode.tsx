import React, { memo } from 'react';
import type { NodeStyle } from '../../types';

export interface GroupNodeData extends Record<string, unknown> {
  label?: string;
  style?: NodeStyle;
  width?: number;
  height?: number;
}

interface GroupNodeProps {
  data: GroupNodeData;
}

export const GroupNode = memo(({ data }: GroupNodeProps) => {
  const style: React.CSSProperties = {
    width: data.width || 200,
    height: data.height || 150,
    backgroundColor: data.style?.fill ?? 'rgba(240, 240, 240, 0.5)',
    border: `${data.style?.strokeWidth ?? 1}px ${data.style?.dashed ? 'dashed' : 'solid'} ${data.style?.stroke ?? '#cccccc'}`,
    borderRadius: data.style?.borderRadius ?? 8,
    padding: 10,
    position: 'relative',
  };

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: data.style?.fill ?? '#f0f0f0',
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 4,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <div style={style}>
      {data.label && <div style={labelStyle}>{data.label}</div>}
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
