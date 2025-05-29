
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
  const calculatePath = () => {
    const start = startPoint;
    const end = endPoint;
    
    // Calculate orthogonal path with improved obstacle avoidance
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    // Use multiple waypoints for better routing
    let waypoints: { x: number; y: number }[] = [];
    
    // Simple case: direct horizontal connection
    if (Math.abs(deltaY) < 20) {
      const midX = start.x + deltaX * 0.5;
      waypoints = [
        { x: midX, y: start.y },
        { x: midX, y: end.y }
      ];
    } else {
      // More complex routing with obstacle avoidance
      let midX = start.x + deltaX * 0.6;
      
      // Check for obstacles and adjust path
      const obstacleNodes = nodes.filter(node => {
        const nodeRect = {
          left: node.x - 20,
          right: node.x + 164,
          top: node.y - 20,
          bottom: node.y + 100
        };
        
        // Check if the intended path intersects with this node
        const pathIntersects = (
          midX > nodeRect.left && 
          midX < nodeRect.right &&
          ((start.y > nodeRect.top && start.y < nodeRect.bottom) ||
           (end.y > nodeRect.top && end.y < nodeRect.bottom) ||
           (start.y < nodeRect.top && end.y > nodeRect.bottom) ||
           (start.y > nodeRect.bottom && end.y < nodeRect.top))
        );
        
        return pathIntersects;
      });
      
      // Adjust path to avoid obstacles
      if (obstacleNodes.length > 0) {
        const obstacle = obstacleNodes[0];
        if (start.x < obstacle.x) {
          midX = obstacle.x - 30;
        } else {
          midX = obstacle.x + 174;
        }
      }
      
      waypoints = [
        { x: midX, y: start.y },
        { x: midX, y: end.y }
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

  const pathData = calculatePath();

  return (
    <path
      d={pathData}
      stroke={isTemporary ? "#3b82f6" : "#6b7280"}
      strokeWidth="2"
      fill="none"
      strokeDasharray={isTemporary ? "8,4" : "none"}
      className="transition-all duration-200"
      style={{ vectorEffect: 'non-scaling-stroke' }}
    />
  );
};
