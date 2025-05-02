import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getWebSocketClient, WebSocketClient, EventType } from '@/lib/websocket';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  client: WebSocketClient;
  isConnected: boolean;
  isAuthenticated: boolean;
  lastEvent: {
    type: EventType;
    payload: any;
  } | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const client = getWebSocketClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastEvent, setLastEvent] = useState<{type: EventType, payload: any} | null>(null);
  
  // Inicializar conexão WebSocket
  useEffect(() => {
    // Função para se conectar ao servidor WebSocket
    const connect = async () => {
      try {
        await client.connect();
        setIsConnected(true);
        
        // Se o usuário estiver autenticado, tente autenticar a conexão WebSocket
        if (user) {
          const authSuccess = await client.authenticate();
          setIsAuthenticated(authSuccess);
          
          if (!authSuccess) {
            console.error("Falha ao autenticar conexão WebSocket");
          }
        }
      } catch (error) {
        console.error("Erro ao conectar WebSocket:", error);
      }
    };
    
    // Conectar ao WebSocket quando o componente montar
    connect();
    
    // Limpar quando o componente desmontar
    return () => {
      client.disconnect();
      setIsConnected(false);
      setIsAuthenticated(false);
    };
  }, []);
  
  // Reagir a mudanças no estado de autenticação do usuário
  useEffect(() => {
    const authenticate = async () => {
      if (user && isConnected && !isAuthenticated) {
        const authSuccess = await client.authenticate();
        setIsAuthenticated(authSuccess);
      } else if (!user) {
        setIsAuthenticated(false);
      }
    };
    
    authenticate();
  }, [user, isConnected]);
  
  // Configurar listeners de eventos
  useEffect(() => {
    // Listener para recompensas
    const handleReward = (payload: any) => {
      setLastEvent({ type: EventType.REWARD_EARNED, payload });
      
      toast({
        title: "Recompensa Recebida!",
        description: `Você recebeu ${payload.amount} FURIA Coins: ${payload.reason}`,
        variant: "success",
      });
    };
    
    // Listener para mudanças de status em resgates
    const handleRedemptionStatus = (payload: any) => {
      setLastEvent({ type: EventType.REDEMPTION_STATUS_CHANGED, payload });
      
      const statusMessages: Record<string, string> = {
        processing: "Seu resgate está sendo processado",
        shipped: "Seu resgate foi enviado",
        delivered: "Seu resgate foi entregue",
        cancelled: "Seu resgate foi cancelado"
      };
      
      toast({
        title: "Atualização de Resgate",
        description: statusMessages[payload.status] || `Status atualizado: ${payload.status}`,
        variant: payload.status === "cancelled" ? "destructive" : "default",
      });
    };
    
    // Listener para novos conteúdos
    const handleNewContent = (payload: any) => {
      setLastEvent({ type: EventType.CONTENT_PUBLISHED, payload });
      
      toast({
        title: "Novo Conteúdo",
        description: `${payload.title} - Clique para ver`,
        variant: "default",
        action: {
          label: "Ver",
          onClick: () => window.location.href = `/content/${payload.slug}`
        }
      });
    };
    
    // Listener para novas pesquisas
    const handleNewSurvey = (payload: any) => {
      setLastEvent({ type: EventType.SURVEY_PUBLISHED, payload });
      
      toast({
        title: "Nova Pesquisa",
        description: `${payload.title} - Participe e ganhe FURIA Coins!`,
        variant: "default",
        action: {
          label: "Participar",
          onClick: () => window.location.href = `/surveys/${payload.id}`
        }
      });
    };
    
    // Registrar listeners
    client.on(EventType.REWARD_EARNED, handleReward);
    client.on(EventType.REDEMPTION_STATUS_CHANGED, handleRedemptionStatus);
    client.on(EventType.CONTENT_PUBLISHED, handleNewContent);
    client.on(EventType.SURVEY_PUBLISHED, handleNewSurvey);
    
    // Limpar listeners
    return () => {
      client.off(EventType.REWARD_EARNED, handleReward);
      client.off(EventType.REDEMPTION_STATUS_CHANGED, handleRedemptionStatus);
      client.off(EventType.CONTENT_PUBLISHED, handleNewContent);
      client.off(EventType.SURVEY_PUBLISHED, handleNewSurvey);
    };
  }, [toast]);
  
  return (
    <WebSocketContext.Provider value={{ client, isConnected, isAuthenticated, lastEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocketContext deve ser usado dentro de um WebSocketProvider');
  }
  
  return context;
};