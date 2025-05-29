
import React from 'react';
import { Node } from './FlowchartNode';

export interface ConnectionType {
  id: string;
  sourceId: string;
  targetId: string;
}

interface ConnectionProps {
  connection: ConnectionType;
  nodes: Node[];
  onDelete?: () => void;
  isTemporary?: boolean;
}

export const Connection: React.FC<ConnectionProps> = ({ 
  connection, 
  nodes, 
  onDelete,
  isTemporary = false 
}) => {
  const sourceNode = nodes.find(n => n.id === connection.sourceId);
  const targetNode = nodes.find(n => n.id === connection.targetId);

  if (!sourceNode || !targetNode) return null;

  // Calculate connection points
  const startX = sourceNode.x + 144; // Right side of source node (width: 144px)
  const startY = sourceNode.y + 40;  // Middle of source node (height: 80px)
  const endX = targetNode.x;         // Left side of target node
  const endY = targetNode.y + 40;    // Middle of target node

  // Create orthogonal path (90-degree elbows)
  const midX = startX + (endX - startX) / 2;
  const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

  // Calculate path length for animation
  const pathLength = Math.abs(midX - startX) + Math.abs(endY - startY) + Math.abs(endX - midX);

  return (
    <g>
      {/* Background path for hover detection */}
      {!isTemporary && onDelete && (
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="16"
          fill="none"
          className="cursor-pointer"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        >
          <title>Delete line</title>
        </path>
      )}

      {/* Main connection line */}
      <path
        d={pathData}
        stroke={isTemporary ? "#3b82f6" : "#6b7280"}
        strokeWidth="3"
        fill="none"
        strokeDasharray={isTemporary ? "8,4" : "none"}
        className="transition-all duration-200 pointer-events-none"
      />
      
      {/* Animated flow dots */}
      {!isTemporary && (
        <>
          <circle
            r="3"
            fill="#3b82f6"
            className="pointer-events-none"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={pathData}
            />
          </circle>
          <circle
            r="2"
            fill="#60a5fa"
            className="pointer-events-none"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={pathData}
              begin="0.5s"
            />
          </circle>
          <circle
            r="2"
            fill="#60a5fa"
            className="pointer-events-none"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={pathData}
              begin="1s"
            />
          </circle>
        </>
      )}

      {/* Hover tooltip for non-temporary connections */}
      {!isTemporary && onDelete && (
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          className="cursor-pointer hover:stroke-red-400 hover:stroke-opacity-30"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        />
      )}
    </g>
  );
};
