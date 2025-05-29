
import { useState, useCallback } from 'react';
import { Node } from '@/components/FlowchartNode';
import { ConnectionType } from '@/components/Connection';

export const useFlowchartState = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const addNode = useCallback(({ type, x, y }: { type: 'step' | 'condition' | 'notification'; x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      label: '',
      x: Math.max(0, x - 72), // Center the node on the click point
      y: Math.max(0, y - 40)
    };
    
    setNodes(prev => [...prev, newNode]);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.sourceId !== nodeId && conn.targetId !== nodeId
    ));
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x, y } : node
    ));
  }, []);

  const addConnection = useCallback((connection: ConnectionType) => {
    setConnections(prev => {
      // Prevent duplicate connections
      const exists = prev.some(conn => 
        conn.sourceId === connection.sourceId && conn.targetId === connection.targetId
      );
      if (exists) return prev;
      
      return [...prev, connection];
    });
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);

  return {
    nodes,
    connections,
    selectedNode,
    setSelectedNode,
    addNode,
    deleteNode,
    updateNodePosition,
    addConnection,
    deleteConnection
  };
};
