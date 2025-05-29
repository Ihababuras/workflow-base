
import React from 'react';
import { Node } from './FlowchartNode';

interface ConnectionPathProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  nodes: Node[];
  isTemporary?: boolean;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  startPoint,
  endPoint,
  nodes,
  isTemporary = false
}) => {
  // Calculate orthogonal path with obstacle avoidance
  const calculatePath = () => {
    const start = startPoint;
    const end = endPoint;
    
    // Simple orthogonal routing with basic obstacle avoidance
    const midX = start.x + (end.x - start.x) * 0.7;
    
    // Check if path intersects with any nodes and adjust
    let adjustedMidX = midX;
    
    nodes.forEach(node => {
      if (
        adjustedMidX > node.x - 20 && 
        adjustedMidX < node.x + 164 && // node width + padding
        ((start.y > node.y - 20 && start.y < node.y + 100) || 
         (end.y > node.y - 20 && end.y < node.y + 100))
      ) {
        // Adjust path to go around the node
        if (start.x < node.x) {
          adjustedMidX = node.x - 30;
        } else {
          adjustedMidX = node.x + 174;
        }
      }
    });

    return `M ${start.x} ${start.y} L ${adjustedMidX} ${start.y} L ${adjustedMidX} ${end.y} L ${end.x} ${end.y}`;
  };

  const pathData = calculatePath();

  return (
    <path
      d={pathData}
      stroke={isTemporary ? "#3b82f6" : "#6b7280"}
      strokeWidth="3"
      fill="none"
      strokeDasharray={isTemporary ? "8,4" : "none"}
      className="transition-all duration-200"
    />
  );
};
