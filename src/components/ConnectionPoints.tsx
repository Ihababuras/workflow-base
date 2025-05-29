
import React from 'react';
import { Node } from './FlowchartNode';

export interface ConnectionPoint {
  id: string;
  x: number;
  y: number;
  side: 'left' | 'top' | 'right' | 'bottom';
  nodeId: string;
  type: 'entry' | 'exit';
}

interface ConnectionPointsProps {
  nodes: Node[];
  highlightedPoint?: ConnectionPoint | null;
  existingConnections: Array<{ sourceId: string; targetId: string }>;
  draggingFromNodeId?: string;
}

export const ConnectionPoints: React.FC<ConnectionPointsProps> = ({ 
  nodes, 
  highlightedPoint,
  existingConnections,
  draggingFromNodeId
}) => {
  const getAllConnectionPoints = (): ConnectionPoint[] => {
    const points: ConnectionPoint[] = [];
    
    nodes.forEach(node => {
      if (node.type === 'condition') {
        // Diamond shape: top (entry), left and right (exits)
        points.push(
          { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top', type: 'entry' },
          { id: `${node.id}-left`, nodeId: node.id, x: node.x + 36, y: node.y + 40, side: 'left', type: 'exit' },
          { id: `${node.id}-right`, nodeId: node.id, x: node.x + 108, y: node.y + 40, side: 'right', type: 'exit' }
        );
      } else {
        // Step/notification: left, top, bottom (entries), right (exit)
        points.push(
          { id: `${node.id}-left`, nodeId: node.id, x: node.x, y: node.y + 40, side: 'left', type: 'entry' },
          { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top', type: 'entry' },
          { id: `${node.id}-bottom`, nodeId: node.id, x: node.x + 72, y: node.y + 80, side: 'bottom', type: 'entry' },
          { id: `${node.id}-right`, nodeId: node.id, x: node.x + 144, y: node.y + 40, side: 'right', type: 'exit' }
        );
      }
    });
    
    return points;
  };

  const connectionPoints = getAllConnectionPoints();

  return (
    <>
      {connectionPoints.map(point => {
        // Don't show points on the node we're dragging from
        if (point.nodeId === draggingFromNodeId) return null;
        
        const isHighlighted = highlightedPoint?.id === point.id;
        
        return (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="8"
            fill={isHighlighted ? "#10b981" : "transparent"}
            stroke={isHighlighted ? "#10b981" : "transparent"}
            strokeWidth="3"
            className={isHighlighted ? "animate-pulse" : ""}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </>
  );
};

export const findNearestConnectionPoint = (
  mouseX: number, 
  mouseY: number, 
  nodes: Node[], 
  excludeNodeId?: string,
  snapDistance: number = 60,
  existingConnections: Array<{ sourceId: string; targetId: string }> = [],
  draggingFromType: 'entry' | 'exit' = 'exit'
): ConnectionPoint | null => {
  const points: ConnectionPoint[] = [];
  
  nodes.forEach(node => {
    if (node.id !== excludeNodeId) {
      if (node.type === 'condition') {
        points.push(
          { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top', type: 'entry' },
          { id: `${node.id}-left`, nodeId: node.id, x: node.x + 36, y: node.y + 40, side: 'left', type: 'exit' },
          { id: `${node.id}-right`, nodeId: node.id, x: node.x + 108, y: node.y + 40, side: 'right', type: 'exit' }
        );
      } else {
        points.push(
          { id: `${node.id}-left`, nodeId: node.id, x: node.x, y: node.y + 40, side: 'left', type: 'entry' },
          { id: `${node.id}-top`, nodeId: node.id, x: node.x + 72, y: node.y, side: 'top', type: 'entry' },
          { id: `${node.id}-bottom`, nodeId: node.id, x: node.x + 72, y: node.y + 80, side: 'bottom', type: 'entry' },
          { id: `${node.id}-right`, nodeId: node.id, x: node.x + 144, y: node.y + 40, side: 'right', type: 'exit' }
        );
      }
    }
  });

  // Filter points based on dragging type (entry to exit, exit to entry)
  const validPoints = points.filter(point => {
    // If dragging from exit, can only connect to entries
    // If dragging from entry, can only connect to exits
    return draggingFromType === 'exit' ? point.type === 'entry' : point.type === 'exit';
  });

  let nearest = null;
  let minDistance = Infinity;

  validPoints.forEach(point => {
    // Check if connection already exists
    const connectionExists = existingConnections.some(conn => 
      (conn.sourceId === excludeNodeId && conn.targetId === point.nodeId) ||
      (conn.sourceId === point.nodeId && conn.targetId === excludeNodeId)
    );
    
    if (connectionExists) return;
    
    const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2));
    if (distance < minDistance && distance < snapDistance) {
      minDistance = distance;
      nearest = point;
    }
  });

  return nearest;
};
