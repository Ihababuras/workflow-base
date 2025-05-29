
import React, { useState, useRef, useCallback } from 'react';
import { FlowchartNode } from './FlowchartNode';
import { ContextMenu } from './ContextMenu';
import { Connection } from './Connection';
import { ConnectionPoints, ConnectionPoint, findNearestConnectionPoint } from './ConnectionPoints';
import { ConnectionPath } from './ConnectionPath';
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
  const [isConnecting, setIsConnecting] = useState<{ 
    nodeId: string; 
    startPos: { x: number; y: number };
    startSide: string;
    startType: 'entry' | 'exit';
  } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);
  const [highlightedPoint, setHighlightedPoint] = useState<ConnectionPoint | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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
        setHighlightedPoint(null);
      }
    }
  }, [isConnecting, setSelectedNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Find nearest valid connection point
      const nearest = findNearestConnectionPoint(
        mouseX, 
        mouseY, 
        nodes, 
        isConnecting.nodeId, 
        50,
        connections,
        isConnecting.startType
      );
      
      if (nearest) {
        setHighlightedPoint(nearest);
        setTempConnection({ x: nearest.x, y: nearest.y });
      } else {
        setHighlightedPoint(null);
        setTempConnection({ x: mouseX, y: mouseY });
      }
    }
  }, [isConnecting, nodes, connections]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedNode) {
      deleteNode(selectedNode);
      setSelectedNode(null);
    }
    if (e.key === 'Escape' && isConnecting) {
      setIsConnecting(null);
      setTempConnection(null);
      setHighlightedPoint(null);
    }
  }, [selectedNode, deleteNode, setSelectedNode, isConnecting]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    // Disable text selection when connecting
    if (isConnecting) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isConnecting]);

  const startConnection = useCallback((nodeId: string, position: { x: number; y: number }, side: string) => {
    const node = nodes.find(n => n.id === nodeId);
    let startType: 'entry' | 'exit' = 'exit';
    
    if (node) {
      if (node.type === 'condition') {
        startType = side === 'top' ? 'entry' : 'exit';
      } else {
        startType = 'exit';
      }
    }
    
    setIsConnecting({ 
      nodeId, 
      startPos: position, 
      startSide: side,
      startType
    });
  }, [nodes]);

  const endConnection = useCallback((targetNodeId: string, targetPort?: string) => {
    if (isConnecting && isConnecting.nodeId !== targetNodeId) {
      // Check if connection already exists
      const connectionExists = connections.some(conn => 
        (conn.sourceId === isConnecting.nodeId && conn.targetId === targetNodeId) ||
        (conn.sourceId === targetNodeId && conn.targetId === isConnecting.nodeId)
      );
      
      if (!connectionExists) {
        // Determine source and target based on connection types
        const sourceId = isConnecting.startType === 'exit' ? isConnecting.nodeId : targetNodeId;
        const targetId = isConnecting.startType === 'exit' ? targetNodeId : isConnecting.nodeId;
        
        addConnection({
          id: `${sourceId}-${targetId}-${Date.now()}`,
          sourceId,
          targetId,
          sourcePort: isConnecting.startSide,
          targetPort: targetPort || highlightedPoint?.side
        });
      }
    }
    setIsConnecting(null);
    setTempConnection(null);
    setHighlightedPoint(null);
  }, [isConnecting, addConnection, connections, highlightedPoint]);

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
        style={{ userSelect: isConnecting ? 'none' : 'auto' }}
      >
        {/* SVG layer for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map(connection => (
            <Connection
              key={connection.id}
              connection={connection}
              nodes={nodes}
              onDelete={() => deleteConnection(connection.id)}
              existingConnections={connections}
            />
          ))}
          
          {/* Temporary connection while dragging */}
          {isConnecting && tempConnection && (
            <ConnectionPath
              startPoint={isConnecting.startPos}
              endPoint={tempConnection}
              nodes={nodes}
              isTemporary={true}
            />
          )}
          
          {/* Connection points with highlighting */}
          <ConnectionPoints 
            nodes={nodes} 
            highlightedPoint={highlightedPoint}
            existingConnections={connections}
            draggingFromNodeId={isConnecting?.nodeId}
          />
        </svg>

        {/* Nodes layer */}
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
            existingConnections={connections}
            isConnecting={!!isConnecting}
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
