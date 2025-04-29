import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketClient, EventType, WebSocketMessage } from '../lib/websocket';
import { useAuth } from './use-auth';

type WebSocketHook = {
  isConnected: boolean;
  isAuthenticated: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  authenticate: () => Promise<boolean>;
  subscribe: (event: EventType, callback: (payload: any) => void) => void;
  unsubscribe: (event: EventType, callback: (payload: any) => void) => void;
  send: (type: EventType, payload?: any) => boolean;
  lastEvent: WebSocketMessage | null;
};

/**
 * Hook para usar WebSocket na aplicação
 */
export function useWebSocket(): WebSocketHook {
  const { user, isLoading } = useAuth();
  const client = getWebSocketClient();
  const [isConnected, setIsConnected] = useState<boolean>(client.isConnectedAndReady());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(client.isAuthenticatedAndReady());
  const [lastEvent, setLastEvent] = useState<WebSocketMessage | null>(null);
  
  // Referência para evitar problemas com closures
  const authRef = useRef(isAuthenticated);
  authRef.current = isAuthenticated;
  
  // Handler para eventos do sistema
  const handleSystemEvent = useCallback((event: WebSocketMessage) => {
    setLastEvent(event);
  }, []);
  
  // Conectar ao WebSocket
  const connect = useCallback(async () => {
    try {
      await client.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('[useWebSocket] Erro ao conectar:', error);
      setIsConnected(false);
      throw error;
    }
  }, [client]);
  
  // Autenticar a conexão WebSocket
  const authenticate = useCallback(async () => {
    try {
      const success = await client.authenticate();
      setIsAuthenticated(success);
      return success;
    } catch (error) {
      console.error('[useWebSocket] Erro ao autenticar:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, [client]);
  
  // Desconectar
  const disconnect = useCallback(() => {
    client.disconnect();
    setIsConnected(false);
    setIsAuthenticated(false);
  }, [client]);
  
  // Assinar eventos
  const subscribe = useCallback((event: EventType, callback: (payload: any) => void) => {
    client.on(event, callback);
  }, [client]);
  
  // Cancelar assinatura de eventos
  const unsubscribe = useCallback((event: EventType, callback: (payload: any) => void) => {
    client.off(event, callback);
  }, [client]);
  
  // Enviar mensagem
  const send = useCallback((type: EventType, payload: any = {}) => {
    return client.send(type, payload);
  }, [client]);
  
  // Conectar quando o componente montar
  useEffect(() => {
    let mounted = true;
    
    // Função para configurar a conexão
    const setupConnection = async () => {
      if (!client.isConnectedAndReady()) {
        try {
          await connect();
          
          // Se o usuário estiver autenticado e a conexão não estiver, autenticar
          if (mounted && user && !authRef.current) {
            await authenticate();
          }
        } catch (error) {
          console.error('[useWebSocket] Erro ao configurar conexão:', error);
        }
      }
    };
    
    // Configurar evento do sistema para atualizar o último evento
    const systemEventCallback = (payload: any) => {
      handleSystemEvent({
        type: EventType.PING, // Tipo não importa aqui, será sobrescrito
        payload,
        timestamp: Date.now()
      });
    };
    
    // Assinar eventos do sistema
    client.on(EventType.PING, systemEventCallback);
    client.on(EventType.PONG, systemEventCallback);
    client.on(EventType.ERROR, systemEventCallback);
    
    // Iniciar conexão se não estiver carregando a autenticação
    if (!isLoading) {
      setupConnection();
    }
    
    // Limpar assinaturas quando o componente desmontar
    return () => {
      mounted = false;
      client.off(EventType.PING, systemEventCallback);
      client.off(EventType.PONG, systemEventCallback);
      client.off(EventType.ERROR, systemEventCallback);
    };
  }, [client, connect, authenticate, user, isLoading, handleSystemEvent]);
  
  // Autenticar quando o usuário mudar
  useEffect(() => {
    // Se o usuário está logado e a conexão está ativa mas não autenticada
    if (user && isConnected && !isAuthenticated) {
      authenticate().catch(err => {
        console.error('[useWebSocket] Erro ao autenticar após login:', err);
      });
    }
  }, [user, isConnected, isAuthenticated, authenticate]);
  
  return {
    isConnected,
    isAuthenticated,
    connect,
    disconnect,
    authenticate,
    subscribe,
    unsubscribe,
    send,
    lastEvent
  };
}