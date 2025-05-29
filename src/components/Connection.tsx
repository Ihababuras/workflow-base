
import React from 'react';
import { Node } from './FlowchartNode';
import { ConnectionPath } from './ConnectionPath';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export interface ConnectionType {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: string;
  targetPort?: string;
}

interface ConnectionProps {
  connection: ConnectionType;
  nodes: Node[];
  onDelete?: () => void;
  isTemporary?: boolean;
  existingConnections?: ConnectionType[];
}

export const Connection: React.FC<ConnectionProps> = ({ 
  connection, 
  nodes, 
  onDelete,
  isTemporary = false,
  existingConnections = []
}) => {
  const sourceNode = nodes.find(n => n.id === connection.sourceId);
  const targetNode = nodes.find(n => n.id === connection.targetId);

  if (!sourceNode || !targetNode) return null;

  // Get optimal connection points with dynamic port selection
  const getOptimalConnectionPoints = () => {
    // Get all available ports for each node
    const getAvailablePorts = (node: Node, isSource: boolean) => {
      if (node.type === 'condition') {
        return isSource 
          ? [
              { side: 'left', x: node.x + 36, y: node.y + 40 }, 
              { side: 'right', x: node.x + 108, y: node.y + 40 }
            ]
          : [{ side: 'top', x: node.x + 72, y: node.y }];
      } else {
        return [
          { side: 'left', x: node.x, y: node.y + 40 },
          { side: 'top', x: node.x + 72, y: node.y },
          { side: 'right', x: node.x + 144, y: node.y + 40 },
          { side: 'bottom', x: node.x + 72, y: node.y + 80 }
        ];
      }
    };

    // Use specified ports if available
    if (connection.sourcePort && connection.targetPort) {
      const sourcePorts = getAvailablePorts(sourceNode, true);
      const targetPorts = getAvailablePorts(targetNode, false);
      
      const sourcePort = sourcePorts.find(p => p.side === connection.sourcePort);
      const targetPort = targetPorts.find(p => p.side === connection.targetPort);
      
      if (sourcePort && targetPort) {
        return {
          startPoint: { x: sourcePort.x, y: sourcePort.y },
          endPoint: { x: targetPort.x, y: targetPort.y }
        };
      }
    }

    // Fallback to automatic port selection
    const sourcePorts = getAvailablePorts(sourceNode, true);
    const targetPorts = getAvailablePorts(targetNode, false);
    
    // Find optimal port combination based on distance
    let bestSource = sourcePorts[0];
    let bestTarget = targetPorts[0];
    let minDistance = Infinity;

    sourcePorts.forEach(sourcePort => {
      targetPorts.forEach(targetPort => {
        const distance = Math.sqrt(
          Math.pow(targetPort.x - sourcePort.x, 2) + 
          Math.pow(targetPort.y - sourcePort.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          bestSource = sourcePort;
          bestTarget = targetPort;
        }
      });
    });

    return {
      startPoint: { x: bestSource.x, y: bestSource.y },
      endPoint: { x: bestTarget.x, y: bestTarget.y }
    };
  };

  const { startPoint, endPoint } = getOptimalConnectionPoints();

  return (
    <TooltipProvider>
      <g>
        {/* Main connection path */}
        <ConnectionPath
          startPoint={startPoint}
          endPoint={endPoint}
          nodes={nodes}
          isTemporary={isTemporary}
          sourceNodeId={connection.sourceId}
          targetNodeId={connection.targetId}
          existingConnections={existingConnections}
          onDelete={onDelete}
        />
      </g>
    </TooltipProvider>
  );
};
