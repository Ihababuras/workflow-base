
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
    const sourceCenter = { x: sourceNode.x + 72, y: sourceNode.y + 40 };
    const targetCenter = { x: targetNode.x + 72, y: targetNode.y + 40 };
    
    // Get all available ports for each node
    const getAvailablePorts = (node: Node, isSource: boolean) => {
      if (node.type === 'condition') {
        return isSource 
          ? [{ side: 'left', x: node.x + 36, y: node.y + 40 }, { side: 'right', x: node.x + 108, y: node.y + 40 }]
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

    // Get used ports to avoid reusing them
    const getUsedPorts = (nodeId: string, isSource: boolean) => {
      return existingConnections
        .filter(conn => (isSource ? conn.sourceId === nodeId : conn.targetId === nodeId))
        .map(conn => isSource ? conn.sourcePort : conn.targetPort)
        .filter(Boolean);
    };

    const sourcePorts = getAvailablePorts(sourceNode, true);
    const targetPorts = getAvailablePorts(targetNode, false);
    
    const usedSourcePorts = getUsedPorts(sourceNode.id, true);
    const usedTargetPorts = getUsedPorts(targetNode.id, false);

    // Filter out used ports
    const availableSourcePorts = sourcePorts.filter(port => !usedSourcePorts.includes(port.side));
    const availableTargetPorts = targetPorts.filter(port => !usedTargetPorts.includes(port.side));

    // Find optimal port combination based on distance
    let bestSource = availableSourcePorts[0] || sourcePorts[0];
    let bestTarget = availableTargetPorts[0] || targetPorts[0];
    let minDistance = Infinity;

    availableSourcePorts.forEach(sourcePort => {
      availableTargetPorts.forEach(targetPort => {
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
      endPoint: { x: bestTarget.x, y: bestTarget.y },
      sourcePort: bestSource.side,
      targetPort: bestTarget.side
    };
  };

  const { startPoint, endPoint } = getOptimalConnectionPoints();

  // Calculate path for interaction
  const pathData = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;

  return (
    <TooltipProvider>
      <g>
        {/* Invisible wide path for interaction */}
        {!isTemporary && onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
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
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">Delete line</div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Main connection path */}
        <ConnectionPath
          startPoint={startPoint}
          endPoint={endPoint}
          nodes={nodes}
          isTemporary={isTemporary}
          sourceNodeId={connection.sourceId}
          targetNodeId={connection.targetId}
          existingConnections={existingConnections}
        />

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
    </TooltipProvider>
  );
};
