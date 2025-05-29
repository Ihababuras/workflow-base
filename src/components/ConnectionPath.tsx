
import React, { useState } from 'react';
import { Node } from './FlowchartNode';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface ConnectionPathProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  nodes: Node[];
  isTemporary?: boolean;
  sourceNodeId?: string;
  targetNodeId?: string;
  existingConnections?: Array<{ sourceId: string; targetId: string; sourcePort?: string; targetPort?: string }>;
  onDelete?: () => void;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  startPoint,
  endPoint,
  nodes,
  isTemporary = false,
  sourceNodeId,
  targetNodeId,
  existingConnections = [],
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  if (isTemporary) {
    return (
      <path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeDasharray="8,4"
        className="animate-pulse"
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
    );
  }

  return (
    <TooltipProvider>
      <g>
        {/* Invisible wide path for interaction */}
        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <path
                d={pathData}
                stroke="transparent"
                strokeWidth="16"
                fill="none"
                className="cursor-pointer"
                style={{ pointerEvents: 'all' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
              <div className="text-sm">Double-click or right-click to delete</div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Main animated dotted line */}
        <path
          d={pathData}
          stroke="#6b7280"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
          className="animate-[dash_2s_linear_infinite]"
          style={{ 
            vectorEffect: 'non-scaling-stroke',
            strokeDashoffset: 'var(--dash-offset, 0)'
          }}
        />

        {/* Hover highlight - only show when hovering the line itself */}
        {isHovered && onDelete && (
          <path
            d={pathData}
            stroke="rgba(239, 68, 68, 0.6)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8,4"
            className="animate-pulse"
            style={{ 
              vectorEffect: 'non-scaling-stroke',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Connection dots animation */}
        <g className="pointer-events-none">
          <circle r="3" fill="#3b82f6" opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathData} />
          </circle>
          <circle r="2" fill="#60a5fa" opacity="0.6">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathData} begin="1s" />
          </circle>
        </g>
      </g>
    </TooltipProvider>
  );
};
