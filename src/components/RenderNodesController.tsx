import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface RenderNode {
  id: string;
  name: string;
  engine: string;
  status: 'idle' | 'rendering' | 'paused';
  blocks: Block[];
}

interface Block {
  id: string;
  sceneName: string;
  startFrame: number;
  endFrame: number;
  color: string;
}

interface RenderNodesContextType {
  renderNodes: RenderNode[];
  setRenderNodes: (nodes: RenderNode[]) => void;
}

const RenderNodesContext = createContext<RenderNodesContextType | undefined>(undefined);

export const RenderNodesProvider = ({ children }: { children: ReactNode }) => {
  const [renderNodes, setRenderNodes] = useState<RenderNode[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'clientList') {
          const updatedNodes = data.clients.map((client: { hostname: string }) => ({
            id: `node-${client.hostname}`,
            name: client.hostname,
            engine: 'Unknown Engine', // Default value, can be updated
            status: 'idle',
            blocks: [],
          }));
          setRenderNodes(updatedNodes);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <RenderNodesContext.Provider value={{ renderNodes, setRenderNodes }}>
      {children}
    </RenderNodesContext.Provider>
  );
};

export const useRenderNodes = () => {
  const context = useContext(RenderNodesContext);
  if (!context) {
    throw new Error('useRenderNodes must be used within a RenderNodesProvider');
  }
  return context;
};
