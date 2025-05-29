
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface Node {
  id: string;
  type: 'step' | 'condition' | 'notification';
  label: string;
  x: number;
  y: number;
}

interface FlowchartNodeProps {
  node: Node;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
  onStartConnection: (nodeId: string, position: { x: number; y: number }, side: string) => void;
  onEndConnection: (nodeId: string) => void;
  existingConnections: Array<{ sourceId: string; targetId: string }>;
  style?: React.CSSProperties;
  isConnecting?: boolean;
}

const getNodeStyle = (type: string) => {
  switch (type) {
    case 'step':
      return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-900',
        icon: '📋',
        defaultLabel: 'Process Step'
      };
    case 'condition':
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-900',
        icon: '❓',
        defaultLabel: 'Decision Point'
      };
    case 'notification':
      return {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-900',
        icon: '📢',
        defaultLabel: 'Notification'
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-900',
        icon: '📄',
        defaultLabel: 'Node'
      };
  }
};

export const FlowchartNode: React.FC<FlowchartNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  onStartConnection,
  onEndConnection,
  existingConnections,
  style,
  isConnecting = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label || getNodeStyle(node.type).defaultLabel);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  const nodeStyle = getNodeStyle(node.type);

  // Get connection points based on node type
  const getConnectionPoints = () => {
    if (node.type === 'condition') {
      // Diamond shape: top (entry), left and right (exits)
      return [
        { id: 'top', x: node.x + 72, y: node.y, side: 'top', type: 'entry' },
        { id: 'left', x: node.x + 36, y: node.y + 40, side: 'left', type: 'exit' },
        { id: 'right', x: node.x + 108, y: node.y + 40, side: 'right', type: 'exit' }
      ];
    } else {
      // Step/notification: all sides can be entry or exit
      return [
        { id: 'left', x: node.x, y: node.y + 40, side: 'left', type: 'dynamic' },
        { id: 'top', x: node.x + 72, y: node.y, side: 'top', type: 'dynamic' },
        { id: 'bottom', x: node.x + 72, y: node.y + 80, side: 'bottom', type: 'dynamic' },
        { id: 'right', x: node.x + 144, y: node.y + 40, side: 'right', type: 'dynamic' }
      ];
    }
  };

  const connectionPoints = getConnectionPoints();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nodeX: node.x,
      nodeY: node.y
    });
  }, [onSelect, node.x, node.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    onMove(
      Math.max(0, dragStart.nodeX + deltaX),
      Math.max(0, dragStart.nodeY + deltaY)
    );
  }, [isDragging, dragStart, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onDelete();
    }
  }, [onDelete, isEditing]);

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnecting) {
      setIsEditing(true);
    }
  }, [isConnecting]);

  const handleLabelSubmit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleConnectionStart = useCallback((e: React.MouseEvent, point: any) => {
    e.stopPropagation();
    onStartConnection(node.id, { x: point.x, y: point.y }, point.side);
  }, [node.id, onStartConnection]);

  const handleConnectionEnd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEndConnection(node.id);
  }, [node.id, onEndConnection]);

  // Render diamond shape for condition
  if (node.type === 'condition') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                userSelect: isConnecting ? 'none' : 'auto',
                ...style
              }}
            >
              <div
                className={cn(
                  'relative w-36 h-20 cursor-move transition-all duration-200 hover:shadow-lg',
                  isSelected && 'ring-2 ring-blue-500 ring-offset-2',
                  isDragging && 'shadow-xl scale-105',
                  isConnecting && 'pointer-events-none'
                )}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
              >
                {/* Diamond shape */}
                <div
                  className={cn(
                    'w-full h-full transform rotate-45 border-2',
                    nodeStyle.bg,
                    'flex items-center justify-center'
                  )}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }}
                >
                  <div className={cn('transform -rotate-45 p-2 text-center', nodeStyle.text)}>
                    <div className="flex items-center gap-1 mb-1 justify-center">
                      <span className="text-sm">{nodeStyle.icon}</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleLabelSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSubmit()}
                        className="text-xs bg-transparent border-none outline-none w-full text-center"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className={cn(
                          'text-xs font-medium truncate cursor-text',
                          isConnecting && 'pointer-events-none select-none'
                        )}
                        onClick={handleLabelClick}
                      >
                        {label}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection dots for diamond */}
                {connectionPoints.map((point) => (
                  <div
                    key={point.id}
                    className={cn(
                      'absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-crosshair transition-all duration-200',
                      hoveredDot === point.id && 'scale-150 bg-blue-600',
                      point.side === 'top' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
                      point.side === 'left' && 'left-6 top-1/2 -translate-x-1/2 -translate-y-1/2',
                      point.side === 'right' && 'right-6 top-1/2 translate-x-1/2 -translate-y-1/2'
                    )}
                    style={{ zIndex: 10 }}
                    onMouseDown={(e) => handleConnectionStart(e, point)}
                    onMouseUp={handleConnectionEnd}
                    onMouseEnter={() => setHoveredDot(point.id)}
                    onMouseLeave={() => setHoveredDot(null)}
                  />
                ))}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{nodeStyle.defaultLabel}</div>
              <div className="text-xs opacity-70">{label}</div>
              <div className="text-xs opacity-50 mt-1">
                Entry: Top • Exits: Left, Right
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Regular rectangular nodes (step, notification)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute"
            style={{
              left: node.x,
              top: node.y,
              userSelect: isConnecting ? 'none' : 'auto',
              ...style
            }}
          >
            <Card
              className={cn(
                'relative w-36 h-20 cursor-move transition-all duration-200 hover:shadow-lg',
                nodeStyle.bg,
                isSelected && 'ring-2 ring-blue-500 ring-offset-2',
                isDragging && 'shadow-xl scale-105',
                isConnecting && 'pointer-events-none'
              )}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              <div className={cn('p-3 h-full flex flex-col justify-center', nodeStyle.text)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{nodeStyle.icon}</span>
                  <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                    {node.type}
                  </span>
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleLabelSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleLabelSubmit()}
                    className="text-sm font-medium bg-transparent border-none outline-none w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    className={cn(
                      'text-sm font-medium truncate cursor-text',
                      isConnecting && 'pointer-events-none select-none'
                    )}
                    onClick={handleLabelClick}
                  >
                    {label}
                  </div>
                )}
              </div>

              {/* Connection dots */}
              {connectionPoints.map((point) => (
                <div
                  key={point.id}
                  className={cn(
                    'absolute w-3 h-3 rounded-full border-2 border-white cursor-crosshair transition-all duration-200',
                    hoveredDot === point.id && 'scale-150',
                    'bg-gray-500',
                    hoveredDot === point.id && 'bg-gray-600',
                    point.side === 'left' && 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
                    point.side === 'top' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
                    point.side === 'right' && 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
                    point.side === 'bottom' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
                  )}
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleConnectionStart(e, point)}
                  onMouseUp={handleConnectionEnd}
                  onMouseEnter={() => setHoveredDot(point.id)}
                  onMouseLeave={() => setHoveredDot(null)}
                />
              ))}
            </Card>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{nodeStyle.defaultLabel}</div>
            <div className="text-xs opacity-70">{label}</div>
            <div className="text-xs opacity-50 mt-1">
              All ports can be entry or exit
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
