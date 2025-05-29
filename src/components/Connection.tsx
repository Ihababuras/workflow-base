
import React from 'react';
import { Node } from './FlowchartNode';
import { ConnectionPath } from './ConnectionPath';
import { ConnectionDots } from './ConnectionDots';

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

  // Calculate optimal connection points
  const getOptimalConnectionPoints = () => {
    const sourceCenter = { x: sourceNode.x + 72, y: sourceNode.y + 40 };
    const targetCenter = { x: targetNode.x + 72, y: targetNode.y + 40 };
    
    let startPoint, endPoint;
    
    if (sourceNode.type === 'condition') {
      // For conditions, determine exit point based on target position
      if (targetCenter.x < sourceCenter.x) {
        startPoint = { x: sourceNode.x + 36, y: sourceNode.y + 40 }; // left exit
      } else {
        startPoint = { x: sourceNode.x + 108, y: sourceNode.y + 40 }; // right exit
      }
    } else {
      // For steps, always use right side as exit
      startPoint = { x: sourceNode.x + 144, y: sourceNode.y + 40 };
    }
    
    // Target entry point
    if (targetNode.type === 'condition') {
      endPoint = { x: targetNode.x + 72, y: targetNode.y }; // top entry
    } else {
      // Choose best entry point based on source position
      if (startPoint.x < targetCenter.x) {
        endPoint = { x: targetNode.x, y: targetNode.y + 40 }; // left entry
      } else if (startPoint.y < targetCenter.y) {
        endPoint = { x: targetNode.x + 72, y: targetNode.y }; // top entry
      } else {
        endPoint = { x: targetNode.x + 72, y: targetNode.y + 80 }; // bottom entry
      }
    }
    
    return { startPoint, endPoint };
  };

  const { startPoint, endPoint } = getOptimalConnectionPoints();

  // Calculate path for interaction
  const midX = startPoint.x + (endPoint.x - startPoint.x) * 0.6;
  const pathData = `M ${startPoint.x} ${startPoint.y} L ${midX} ${startPoint.y} L ${midX} ${endPoint.y} L ${endPoint.x} ${endPoint.y}`;

  return (
    <g>
      {/* Invisible wide path for interaction */}
      {!isTemporary && onDelete && (
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="16"
          fill="none"
          className="cursor-pointer"
          style={{ pointerEvents: 'all' }}
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
          <title>Double-click or right-click to delete connection</title>
        </path>
      )}

      {/* Main connection path */}
      <ConnectionPath
        startPoint={startPoint}
        endPoint={endPoint}
        nodes={nodes}
        isTemporary={isTemporary}
      />
      
      {/* Animated flow dots - only for permanent connections */}
      {!isTemporary && (
        <ConnectionDots pathData={pathData} isVisible={true} />
      )}

      {/* Hover highlight */}
      {!isTemporary && onDelete && (
        <path
          d={pathData}
          stroke="rgba(239, 68, 68, 0.3)"
          strokeWidth="6"
          fill="none"
          className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ pointerEvents: 'all' }}
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
