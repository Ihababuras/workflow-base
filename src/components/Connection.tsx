
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

  return (
    <g>
      {/* Main connection line */}
      <path
        d={pathData}
        stroke={isTemporary ? "#3b82f6" : "#6b7280"}
        strokeWidth="2"
        fill="none"
        strokeDasharray={isTemporary ? "5,5" : "none"}
        className="transition-all duration-200"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isTemporary ? "#3b82f6" : "#6b7280"}
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
      />

      {/* Invisible wider path for easier clicking */}
      {!isTemporary && onDelete && (
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          className="cursor-pointer"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Double-click to delete connection"
        />
      )}
    </g>
  );
};
