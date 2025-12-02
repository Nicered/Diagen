import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { BaseNodeData } from './BaseNode';

interface ShapeNodeProps {
  data: BaseNodeData;
}

const baseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 14,
};

const handleStyle: React.CSSProperties = {
  visibility: 'hidden',
};

// Circle Node
export const CircleNode = memo(({ data }: ShapeNodeProps) => {
  const size = 80;
  const style: React.CSSProperties = {
    ...baseStyle,
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: data.style?.fill ?? '#ffffff',
    border: `${data.style?.strokeWidth ?? 1}px ${data.style?.dashed ? 'dashed' : 'solid'} ${data.style?.stroke ?? '#333333'}`,
  };

  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <span>{data.label}</span>
    </div>
  );
});
CircleNode.displayName = 'CircleNode';

// Diamond Node
export const DiamondNode = memo(({ data }: ShapeNodeProps) => {
  const size = 80;
  const style: React.CSSProperties = {
    ...baseStyle,
    width: size,
    height: size,
    backgroundColor: data.style?.fill ?? '#ffffff',
    border: `${data.style?.strokeWidth ?? 1}px ${data.style?.dashed ? 'dashed' : 'solid'} ${data.style?.stroke ?? '#333333'}`,
    transform: 'rotate(45deg)',
  };

  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <span style={{ transform: 'rotate(-45deg)' }}>{data.label}</span>
    </div>
  );
});
DiamondNode.displayName = 'DiamondNode';

// Hexagon Node
export const HexagonNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 120, height: 70 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <svg
        width="120"
        height="70"
        viewBox="0 0 120 70"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <polygon
          points="20,0 100,0 120,35 100,70 20,70 0,35"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
HexagonNode.displayName = 'HexagonNode';

// Cylinder Node (Database)
export const CylinderNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 100, height: 80 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <svg
        width="100"
        height="80"
        viewBox="0 0 100 80"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Bottom ellipse */}
        <ellipse cx="50" cy="70" rx="48" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Body */}
        <rect x="2" y="10" width="96" height="60" fill={fill} stroke="none" />
        <line x1="2" y1="10" x2="2" y2="70" stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="98" y1="10" x2="98" y2="70" stroke={stroke} strokeWidth={strokeWidth} />
        {/* Top ellipse */}
        <ellipse cx="50" cy="10" rx="48" ry="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
          paddingTop: 15,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
CylinderNode.displayName = 'CylinderNode';

// Cloud Node
export const CloudNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 140, height: 80 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <svg
        width="140"
        height="80"
        viewBox="0 0 140 80"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d="M25,60
             a20,20 0 0,1 0,-40
             a25,25 0 0,1 45,-10
             a30,30 0 0,1 50,25
             a20,20 0 0,1 -15,25
             Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
CloudNode.displayName = 'CloudNode';

// Person Node
export const PersonNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 80, height: 100 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Head */}
        <circle cx="40" cy="20" r="18" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Body */}
        <path
          d="M20,45 L40,40 L60,45 L55,85 L25,85 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
PersonNode.displayName = 'PersonNode';

// Document Node
export const DocumentNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 100, height: 80 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <svg
        width="100"
        height="80"
        viewBox="0 0 100 80"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d="M2,2 L98,2 L98,65 Q75,75 50,65 Q25,55 2,65 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
          paddingBottom: 10,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
DocumentNode.displayName = 'DocumentNode';

// Queue Node
export const QueueNode = memo(({ data }: ShapeNodeProps) => {
  const fill = data.style?.fill ?? '#ffffff';
  const stroke = data.style?.stroke ?? '#333333';
  const strokeWidth = data.style?.strokeWidth ?? 1;

  return (
    <div style={{ position: 'relative', width: 120, height: 60 }}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <svg
        width="120"
        height="60"
        viewBox="0 0 120 60"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Left ellipse */}
        <ellipse cx="15" cy="30" rx="13" ry="28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Body */}
        <rect x="15" y="2" width="90" height="56" fill={fill} stroke="none" />
        <line x1="15" y1="2" x2="105" y2="2" stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="15" y1="58" x2="105" y2="58" stroke={stroke} strokeWidth={strokeWidth} />
        {/* Right ellipse */}
        <ellipse cx="105" cy="30" rx="13" ry="28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
      <div
        style={{
          ...baseStyle,
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {data.label}
      </div>
    </div>
  );
});
QueueNode.displayName = 'QueueNode';
