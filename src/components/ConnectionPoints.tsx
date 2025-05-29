
import React from 'react';
import { Node } from './FlowchartNode';

export interface ConnectionPoint {
  id: string;
  x: number;
  y: number;
  side: 'left' | 'top' | 'right' | 'bottom';
  nodeId: string;
}

interface ConnectionPointsProps {
  nodes: Node[];
  highlightedPoint?: ConnectionPoint | null;
}

export const ConnectionPoints: React.FC<ConnectionPointsProps> = ({ 
  nodes, 
  highlightedPoint 
}) => {
  const getAllConnectionPoints = (): ConnectionPoint[] => {
    const points: ConnectionPoint[] = [];
    nodes.forEach(node => {
      points.push(
        { id: `${node.id}-left`, nodeId: node.id, x: node.x, y: node.y + 40, side: 'left' },
        { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top' },
        { id: `${node.id}-right`, nodeId: node.id, x: node.x + 144, y: node.y + 40, side: 'right' },
        { id: `${node.id}-bottom`, nodeId: node.id, x: node.x + 72, y: node.y + 80, side: 'bottom' }
      );
    });
    return points;
  };

  const connectionPoints = getAllConnectionPoints();

  return (
    <>
      {connectionPoints.map(point => (
        <circle
          key={point.id}
          cx={point.x}
          cy={point.y}
          r="6"
          fill={highlightedPoint?.id === point.id ? "#10b981" : "transparent"}
          stroke={highlightedPoint?.id === point.id ? "#10b981" : "transparent"}
          strokeWidth="2"
          className={highlightedPoint?.id === point.id ? "animate-pulse" : ""}
        />
      ))}
    </>
  );
};

export const findNearestConnectionPoint = (
  mouseX: number, 
  mouseY: number, 
  nodes: Node[], 
  excludeNodeId?: string,
  snapDistance: number = 50
): ConnectionPoint | null => {
  const points: ConnectionPoint[] = [];
  nodes.forEach(node => {
    if (node.id !== excludeNodeId) {
      points.push(
        { id: `${node.id}-left`, nodeId: node.id, x: node.x, y: node.y + 40, side: 'left' },
        { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top' },
        { id: `${node.id}-right`, nodeId: node.id, x: node.x + 144, y: node.y + 40, side: 'right' },
        { id: `${node.id}-bottom`, nodeId: node.id, x: node.x + 72, y: node.y + 80, side: 'bottom' }
      );
    }
  });

  let nearest = null;
  let minDistance = Infinity;

  points.forEach(point => {
    const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2));
    if (distance < minDistance && distance < snapDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return nearest;
};
