
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
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
  onStartConnection: (nodeId: string, position: { x: number; y: number }) => void;
  onEndConnection: (nodeId: string) => void;
  style?: React.CSSProperties;
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
  style
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label || getNodeStyle(node.type).defaultLabel);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const nodeStyle = getNodeStyle(node.type);

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
    setIsEditing(true);
  }, []);

  const handleLabelSubmit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleConnectionStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onStartConnection(node.id, {
      x: node.x + 150,
      y: node.y + 40
    });
  }, [node.id, node.x, node.y, onStartConnection]);

  const handleConnectionEnd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEndConnection(node.id);
  }, [node.id, onEndConnection]);

  return (
    <div
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        ...style
      }}
    >
      <Card
        className={cn(
          'relative w-36 h-20 cursor-move transition-all duration-200 hover:shadow-lg',
          nodeStyle.bg,
          isSelected && 'ring-2 ring-blue-500 ring-offset-2',
          isDragging && 'shadow-xl scale-105'
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`${nodeStyle.defaultLabel} - Double-click to delete`}
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
              className="text-sm font-medium truncate cursor-text"
              onClick={handleLabelClick}
            >
              {label}
            </div>
          )}
        </div>

        {/* Connection dots */}
        <div
          className="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-crosshair transform -translate-y-1/2 -translate-x-1/2 hover:scale-125 transition-transform"
          onMouseUp={handleConnectionEnd}
          title="Connection point"
        />
        
        <div
          className="absolute right-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-crosshair transform -translate-y-1/2 translate-x-1/2 hover:scale-125 transition-transform"
          onMouseDown={handleConnectionStart}
          title="Drag to connect"
        />
      </Card>
    </div>
  );
};
