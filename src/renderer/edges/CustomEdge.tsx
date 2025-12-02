import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
} from '@xyflow/react';
import type { EdgeStyle } from '../../types';

export interface CustomEdgeData extends Record<string, unknown> {
  label?: string;
  style?: EdgeStyle;
}

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: CustomEdgeData;
  markerEnd?: string;
}

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: CustomEdgeProps) {
  const style = data?.style;
  const lineType = style?.lineType ?? 'solid';

  // Use smooth step path for orthogonal edges
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  // Determine stroke style
  let strokeDasharray: string | undefined;
  let strokeWidth = style?.strokeWidth ?? 1;

  if (lineType === 'dashed') {
    strokeDasharray = '5,5';
  } else if (lineType === 'bold') {
    strokeWidth = 2;
  }

  const edgeStyle: React.CSSProperties = {
    stroke: style?.stroke ?? '#333',
    strokeWidth,
    strokeDasharray,
    opacity: style?.opacity ?? 1,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffffff',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              border: '1px solid #e0e0e0',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
