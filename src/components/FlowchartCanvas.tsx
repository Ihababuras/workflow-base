
import React, { useState, useRef, useCallback } from 'react';
import { FlowchartNode } from './FlowchartNode';
import { ContextMenu } from './ContextMenu';
import { Connection } from './Connection';
import { useFlowchartState } from '@/hooks/useFlowchartState';

export const FlowchartCanvas = () => {
  const {
    nodes,
    connections,
    addNode,
    deleteNode,
    updateNodePosition,
    addConnection,
    deleteConnection,
    selectedNode,
    setSelectedNode
  } = useFlowchartState();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState<{ nodeId: string; startPos: { x: number; y: number } } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);
  const [nearestTarget, setNearestTarget] = useState<{ nodeId: string; point: { x: number; y: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get all connection points for all nodes
  const getAllConnectionPoints = useCallback(() => {
    const points: Array<{ nodeId: string; x: number; y: number; side: string }> = [];
    nodes.forEach(node => {
      points.push(
        { nodeId: node.id, x: node.x, y: node.y + 40, side: 'left' },
        { nodeId: node.id, x: node.x + 72, y: node.y, side: 'top' },
        { nodeId: node.id, x: node.x + 144, y: node.y + 40, side: 'right' },
        { nodeId: node.id, x: node.x + 72, y: node.y + 80, side: 'bottom' }
      );
    });
    return points;
  }, [nodes]);

  // Find nearest connection point
  const findNearestConnectionPoint = useCallback((mouseX: number, mouseY: number, excludeNodeId?: string) => {
    const points = getAllConnectionPoints().filter(p => p.nodeId !== excludeNodeId);
    let nearest = null;
    let minDistance = Infinity;

    points.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2));
      if (distance < minDistance && distance < 50) { // 50px snap distance
        minDistance = distance;
        nearest = point;
      }
    });

    return nearest;
  }, [getAllConnectionPoints]);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setContextMenu({ x, y });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setContextMenu(null);
      setSelectedNode(null);
      
      if (isConnecting) {
        setIsConnecting(null);
        setTempConnection(null);
        setNearestTarget(null);
      }
    }
  }, [isConnecting, setSelectedNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Find nearest connection point
      const nearest = findNearestConnectionPoint(mouseX, mouseY, isConnecting.nodeId);
      
      if (nearest) {
        setNearestTarget({ nodeId: nearest.nodeId, point: { x: nearest.x, y: nearest.y } });
        setTempConnection({ x: nearest.x, y: nearest.y });
      } else {
        setNearestTarget(null);
        setTempConnection({ x: mouseX, y: mouseY });
      }
    }
  }, [isConnecting, findNearestConnectionPoint]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedNode) {
      deleteNode(selectedNode);
      setSelectedNode(null);
    }
    if (e.key === 'Escape' && isConnecting) {
      setIsConnecting(null);
      setTempConnection(null);
      setNearestTarget(null);
    }
  }, [selectedNode, deleteNode, setSelectedNode, isConnecting]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startConnection = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setIsConnecting({ nodeId, startPos: position });
  }, []);

  const endConnection = useCallback((targetNodeId: string) => {
    if (isConnecting && isConnecting.nodeId !== targetNodeId) {
      addConnection({
        id: `${isConnecting.nodeId}-${targetNodeId}-${Date.now()}`,
        sourceId: isConnecting.nodeId,
        targetId: targetNodeId
      });
    }
    setIsConnecting(null);
    setTempConnection(null);
    setNearestTarget(null);
  }, [isConnecting, addConnection]);

  return (
    <div className="relative h-full overflow-hidden bg-gray-50">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div
        ref={canvasRef}
        className="relative h-full w-full cursor-crosshair"
        onContextMenu={handleRightClick}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
        {/* Render connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map(connection => (
            <Connection
              key={connection.id}
              connection={connection}
              nodes={nodes}
              onDelete={() => deleteConnection(connection.id)}
            />
          ))}
          
          {/* Temporary connection while dragging */}
          {isConnecting && tempConnection && (
            <Connection
              connection={{
                id: 'temp',
                sourceId: isConnecting.nodeId,
                targetId: 'temp'
              }}
              nodes={[
                ...nodes,
                {
                  id: 'temp',
                  type: 'step',
                  label: '',
                  x: tempConnection.x - 72,
                  y: tempConnection.y - 40
                }
              ]}
              isTemporary={true}
            />
          )}
          
          {/* Highlight nearest target */}
          {nearestTarget && (
            <circle
              cx={nearestTarget.point.x}
              cy={nearestTarget.point.y}
              r="8"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Render nodes */}
        {nodes.map(node => (
          <FlowchartNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onSelect={() => setSelectedNode(node.id)}
            onDelete={() => deleteNode(node.id)}
            onMove={(x, y) => updateNodePosition(node.id, x, y)}
            onStartConnection={startConnection}
            onEndConnection={endConnection}
            style={{ zIndex: 2 }}
          />
        ))}

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAddNode={(type) => {
              addNode({
                type,
                x: contextMenu.x,
                y: contextMenu.y
              });
              setContextMenu(null);
            }}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
};
