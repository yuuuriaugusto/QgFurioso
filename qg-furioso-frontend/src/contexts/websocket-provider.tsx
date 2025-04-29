import React, { createContext, useEffect, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/use-websocket';
import { useAuth } from '../hooks/use-auth';
import { EventType } from '../lib/websocket';

// Contexto do WebSocket para gerenciar conexões e eventos em tempo real
const WebSocketContext = createContext<ReturnType<typeof useWebSocket> | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const websocket = useWebSocket();
  
  // Quando o componente montar, tentar conectar ao WebSocket
  useEffect(() => {
    // Conectar apenas se o usuário estiver autenticado
    if (auth.user && !websocket.isConnected) {
      websocket.connect().catch(error => {
        console.error('[WebSocketProvider] Falha ao conectar ao WebSocket:', error);
      });
    }
  }, [auth.user, websocket]);
  
  // Quando o usuário fizer login, tentar autenticar o WebSocket
  useEffect(() => {
    if (auth.user && websocket.isConnected && !websocket.isAuthenticated) {
      websocket.authenticate().catch(error => {
        console.error('[WebSocketProvider] Falha ao autenticar WebSocket:', error);
      });
    }
  }, [auth.user, websocket.isConnected, websocket.isAuthenticated, websocket]);
  
  // Quando o usuário fizer logout, desconectar do WebSocket
  useEffect(() => {
    if (!auth.user && websocket.isConnected) {
      websocket.disconnect();
    }
  }, [auth.user, websocket.isConnected, websocket]);
  
  // Registrar algumas informações de debug para entender o estado da conexão
  useEffect(() => {
    if (websocket.lastEvent) {
      console.debug(
        `[WebSocketProvider] Evento recebido: ${websocket.lastEvent.type}`,
        websocket.lastEvent.payload
      );
    }
  }, [websocket.lastEvent]);
  
  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext deve ser usado dentro de um WebSocketProvider');
  }
  return context;
};

// Hook de utilidade para assinar eventos específicos
export function useWebSocketEvent(
  eventType: EventType, 
  callback: (payload: any) => void,
  deps: any[] = []
) {
  const { subscribe, unsubscribe } = useWebSocketContext();
  
  useEffect(() => {
    // Assinar o evento
    subscribe(eventType, callback);
    
    // Limpar a assinatura quando o componente desmontar
    return () => {
      unsubscribe(eventType, callback);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, subscribe, unsubscribe, ...deps]);
}