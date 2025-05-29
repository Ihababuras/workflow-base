
import React from 'react';
import { Node } from './FlowchartNode';

interface ConnectionPathProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  nodes: Node[];
  isTemporary?: boolean;
  sourceNodeId?: string;
  targetNodeId?: string;
  existingConnections?: Array<{ sourceId: string; targetId: string; sourcePort?: string; targetPort?: string }>;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  startPoint,
  endPoint,
  nodes,
  isTemporary = false,
  sourceNodeId,
  targetNodeId,
  existingConnections = []
}) => {
  const calculateOptimalPath = () => {
    const start = startPoint;
    const end = endPoint;
    
    // Simple orthogonal routing
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    // Use a midpoint approach for clean orthogonal lines
    let waypoints: { x: number; y: number }[] = [];
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // More horizontal movement
      const midX = start.x + deltaX * 0.6;
      waypoints = [
        { x: midX, y: start.y },
        { x: midX, y: end.y }
      ];
    } else {
      // More vertical movement
      const midY = start.y + deltaY * 0.6;
      waypoints = [
        { x: start.x, y: midY },
        { x: end.x, y: midY }
      ];
    }
    
    // Build the path string
    let pathString = `M ${start.x} ${start.y}`;
    waypoints.forEach(point => {
      pathString += ` L ${point.x} ${point.y}`;
    });
    pathString += ` L ${end.x} ${end.y}`;
    
    return pathString;
  };

  const pathData = calculateOptimalPath();

  return (
    <path
      d={pathData}
      stroke={isTemporary ? "#3b82f6" : "#6b7280"}
      strokeWidth="2"
      fill="none"
      strokeDasharray="8,4"
      className={cn(
        "transition-all duration-200",
        !isTemporary && "animate-[dash_1s_linear_infinite]"
      )}
      style={{ 
        vectorEffect: 'non-scaling-stroke',
        strokeDashoffset: !isTemporary ? 'var(--dash-offset, 0)' : undefined
      }}
    />
  );
};

// Add CSS for dash animation
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');
