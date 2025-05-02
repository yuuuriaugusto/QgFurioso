import { useState, useCallback, useRef, useEffect } from 'react';
import { EventType } from '../lib/websocket';

// Interface para representar um evento WebSocket
interface WebSocketEvent {
  type: EventType;
  payload: any;
}

// Mapa de callbacks para eventos específicos
type EventCallbackMap = Map<EventType, Set<(payload: any) => void>>;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Usar refs para valores que precisam persistir entre renderizações
  const socketRef = useRef<WebSocket | null>(null);
  const eventCallbacksRef = useRef<EventCallbackMap>(new Map());
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 segundo
  
  // Função para criar a URL do WebSocket
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }, []);
  
  // Função para lidar com mensagens recebidas pelo WebSocket
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Processar diferentes tipos de mensagens
      if (data.type === 'auth_success') {
        setIsAuthenticated(true);
        console.debug('[WebSocket] Autenticação bem-sucedida');
        reconnectAttemptsRef.current = 0; // Resetar tentativas de reconexão
      } else if (data.type === 'auth_error') {
        setIsAuthenticated(false);
        setError(new Error(data.error || 'Falha na autenticação'));
        console.error('[WebSocket] Erro de autenticação:', data.error);
      } else if (data.type === 'ping') {
        // Responder a pings do servidor para manter a conexão ativa
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'pong' }));
        }
      } else if (Object.values(EventType).includes(data.type as EventType)) {
        // É um evento definido no EventType, processar e notificar ouvintes
        const eventType = data.type as EventType;
        const callbacks = eventCallbacksRef.current.get(eventType);
        
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data.payload);
            } catch (callbackError) {
              console.error(`[WebSocket] Erro ao processar callback para ${eventType}:`, callbackError);
            }
          });
        }
        
        // Atualizar o último evento recebido
        setLastEvent({ type: eventType, payload: data.payload });
      }
    } catch (error) {
      console.error('[WebSocket] Erro ao processar mensagem:', error, event.data);
    }
  }, []);
  
  // Função para reconectar com backoff exponencial
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('[WebSocket] Número máximo de tentativas de reconexão atingido');
      return;
    }
    
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    
    const delay = Math.min(
      30000, // Máximo de 30 segundos
      baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
    );
    
    console.debug(`[WebSocket] Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect().catch(error => {
        console.error('[WebSocket] Falha ao reconectar:', error);
        scheduleReconnect();
      });
    }, delay);
  }, []);
  
  // Função para conectar ao WebSocket
  const connect = useCallback(async () => {
    try {
      // Fechar qualquer conexão existente
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;
      
      return new Promise<void>((resolve, reject) => {
        socket.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.debug('[WebSocket] Conexão estabelecida');
          resolve();
        };
        
        socket.onclose = (event) => {
          setIsConnected(false);
          setIsAuthenticated(false);
          console.debug('[WebSocket] Conexão fechada', event);
          
          // Tentar reconectar automaticamente se não foi um fechamento limpo
          if (!event.wasClean) {
            scheduleReconnect();
          }
        };
        
        socket.onerror = (event) => {
          const wsError = new Error('Erro de conexão WebSocket');
          setError(wsError);
          console.error('[WebSocket] Erro na conexão', event);
          reject(wsError);
        };
        
        socket.onmessage = handleMessage;
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [getWebSocketUrl, handleMessage, scheduleReconnect]);
  
  // Função para autenticar no WebSocket
  const authenticate = useCallback(async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket não está conectado');
    }
    
    // Enviar mensagem de autenticação
    socketRef.current.send(JSON.stringify({
      type: 'authenticate',
      // O token é obtido automaticamente pelo servidor através do cookie de sessão
    }));
    
    // Retornar uma promessa que resolve quando receber auth_success
    return new Promise<void>((resolve, reject) => {
      const authTimeout = window.setTimeout(() => {
        reject(new Error('Tempo limite de autenticação excedido'));
      }, 5000);
      
      const checkAuth = setInterval(() => {
        if (isAuthenticated) {
          clearTimeout(authTimeout);
          clearInterval(checkAuth);
          resolve();
        }
      }, 100);
    });
  }, [isAuthenticated]);
  
  // Função para desconectar do WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsAuthenticated(false);
    
    // Limpar timeout de reconexão
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // Função para assinar um evento
  const subscribe = useCallback((eventType: EventType, callback: (payload: any) => void) => {
    if (!eventCallbacksRef.current.has(eventType)) {
      eventCallbacksRef.current.set(eventType, new Set());
    }
    
    const callbacks = eventCallbacksRef.current.get(eventType)!;
    callbacks.add(callback);
  }, []);
  
  // Função para cancelar a assinatura de um evento
  const unsubscribe = useCallback((eventType: EventType, callback: (payload: any) => void) => {
    const callbacks = eventCallbacksRef.current.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      
      // Remover o Set se estiver vazio
      if (callbacks.size === 0) {
        eventCallbacksRef.current.delete(eventType);
      }
    }
  }, []);
  
  // Função para enviar uma mensagem pelo WebSocket
  const sendMessage = useCallback((type: string, payload?: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Tentativa de enviar mensagem sem conexão ativa');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('[WebSocket] Erro ao enviar mensagem:', error);
      return false;
    }
  }, []);
  
  // Limpar ao desmontar o componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    isAuthenticated,
    lastEvent,
    error,
    connect,
    authenticate,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
  };
}