import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type WebSocketContextType = {
  socket: WebSocket | null;
  connected: boolean;
  send: (message: string | object) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      setConnected(false);
      
      // Reabrir a conexão após um tempo
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Aqui você pode adicionar um callback para lidar com as mensagens
        // como por exemplo, atualizar o estado do React
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    setSocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);
  
  // Função para enviar mensagem
  const send = (message: string | object) => {
    if (socket && connected) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(messageStr);
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  };
  
  return (
    <WebSocketContext.Provider value={{ socket, connected, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}