
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

  // Calculate connection points based on node positions
  const getOptimalConnectionPoints = () => {
    const sourceCenter = { x: sourceNode.x + 72, y: sourceNode.y + 40 };
    const targetCenter = { x: targetNode.x + 72, y: targetNode.y + 40 };
    
    // Choose the best connection points based on relative positions
    let startPoint, endPoint;
    
    if (sourceCenter.x < targetCenter.x) {
      // Source is to the left of target
      startPoint = { x: sourceNode.x + 144, y: sourceNode.y + 40 }; // right side of source
      endPoint = { x: targetNode.x, y: targetNode.y + 40 }; // left side of target
    } else {
      // Source is to the right of target
      startPoint = { x: sourceNode.x, y: sourceNode.y + 40 }; // left side of source
      endPoint = { x: targetNode.x + 144, y: targetNode.y + 40 }; // right side of target
    }
    
    return { startPoint, endPoint };
  };

  const { startPoint, endPoint } = getOptimalConnectionPoints();

  // Calculate path for interaction
  const midX = startPoint.x + (endPoint.x - startPoint.x) * 0.7;
  const pathData = `M ${startPoint.x} ${startPoint.y} L ${midX} ${startPoint.y} L ${midX} ${endPoint.y} L ${endPoint.x} ${endPoint.y}`;

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

      {/* Main connection path */}
      <ConnectionPath
        startPoint={startPoint}
        endPoint={endPoint}
        nodes={nodes}
        isTemporary={isTemporary}
      />
      
      {/* Animated flow dots */}
      <ConnectionDots pathData={pathData} isVisible={!isTemporary} />

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
