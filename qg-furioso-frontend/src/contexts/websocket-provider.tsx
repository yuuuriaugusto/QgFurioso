import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { WebSocketClient, EventType } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Interface para o contexto do WebSocket
interface WebSocketContextType {
  client: WebSocketClient;
  isConnected: boolean;
  isAuthenticated: boolean;
  lastEvent: {
    type: EventType | string;
    payload: any;
  } | null;
}

// Valor padrão para o contexto
const defaultContext: WebSocketContextType = {
  client: new WebSocketClient(),
  isConnected: false,
  isAuthenticated: false,
  lastEvent: null
};

// Criação do contexto
export const WebSocketContext = createContext<WebSocketContextType>(defaultContext);

// Props do provider
interface WebSocketProviderProps {
  children: ReactNode;
}

// WebSocketProvider - fornecer acesso ao WebSocket em todo o aplicativo
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Estado para o cliente WebSocket
  const [client] = useState<WebSocketClient>(() => new WebSocketClient());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<{type: EventType | string, payload: any} | null>(null);
  
  // Atualizar o token de autenticação quando o usuário mudar
  useEffect(() => {
    if (user) {
      // Simular obtenção de token JWT para autenticação
      // Em produção, utilize um token JWT real gerado pelo backend
      const mockToken = btoa(JSON.stringify({
        sub: user.id,
        name: user.primaryIdentity,
        exp: Math.floor(Date.now() / 1000) + 3600 // Expira em 1 hora
      }));
      
      client.setAuthToken(mockToken);
      
      // Se já estiver conectado, tenta autenticar
      if (isConnected) {
        client.authenticate();
      }
    } else {
      // Limpa o status de autenticação se o usuário deslogar
      setIsAuthenticated(false);
    }
  }, [client, user, isConnected]);
  
  // Lidar com a conexão inicial e reconexões
  useEffect(() => {
    // Handler para o evento de conexão bem-sucedida
    const handleConnection = () => {
      console.log("WebSocket conectado");
      setIsConnected(true);
      
      // Se tivermos um usuário, tentamos autenticar
      if (user) {
        client.authenticate();
      }
    };
    
    // Registrar o handler
    client.on(EventType.CONNECTION_ESTABLISHED, handleConnection);
    
    // Conectar ao WebSocket
    client.connect();
    
    // Limpar ao desmontar
    return () => {
      client.off(EventType.CONNECTION_ESTABLISHED, handleConnection);
      client.disconnect();
    };
  }, [client, user]);
  
  // Registra handlers para eventos de autenticação
  useEffect(() => {
    // Handler para autenticação bem-sucedida
    const handleAuthSuccess = (payload: any) => {
      console.log("WebSocket autenticado com sucesso", payload);
      setIsAuthenticated(true);
      
      toast({
        title: "Autenticação WebSocket",
        description: "Conexão autenticada com sucesso",
        variant: "default"
      });
    };
    
    // Handler para falha na autenticação
    const handleAuthFailure = (payload: any) => {
      console.error("Falha na autenticação WebSocket", payload);
      setIsAuthenticated(false);
      
      toast({
        title: "Erro de Autenticação",
        description: payload.message || "Falha ao autenticar a conexão WebSocket",
        variant: "destructive",
        action: (
          <ToastAction altText="Tentar novamente" onClick={() => client.authenticate()}>
            Tentar novamente
          </ToastAction>
        )
      });
    };
    
    // Registrar os handlers
    client.on(EventType.AUTH_SUCCESS, handleAuthSuccess);
    client.on(EventType.AUTH_FAILURE, handleAuthFailure);
    
    // Limpar ao desmontar
    return () => {
      client.off(EventType.AUTH_SUCCESS, handleAuthSuccess);
      client.off(EventType.AUTH_FAILURE, handleAuthFailure);
    };
  }, [client, toast]);
  
  // Handler para rastrear todos os eventos (para fins de depuração e histórico)
  useEffect(() => {
    const handleAllEvents = (data: {type: EventType | string, payload: any}) => {
      console.log(`Evento WebSocket: ${data.type}`, data.payload);
      setLastEvent({
        type: data.type,
        payload: data.payload
      });
      
      // Processar notificações com base no tipo de evento
      switch (data.type) {
        case EventType.REWARD_EARNED:
          toast({
            title: "Moedas recebidas!",
            description: `Você recebeu ${data.payload.amount} moedas: ${data.payload.reason}`,
            variant: "default",
            action: (
              <ToastAction altText="Ver saldo" onClick={() => window.location.href = "/loja"}>
                Ver saldo
              </ToastAction>
            )
          });
          break;
          
        case EventType.REDEMPTION_STATUS_CHANGED:
          toast({
            title: "Status de resgate atualizado",
            description: `Seu resgate "${data.payload.itemName}" está agora ${data.payload.status}`,
            variant: "default",
            action: (
              <ToastAction altText="Ver detalhes" onClick={() => window.location.href = "/meu-qg"}>
                Ver detalhes
              </ToastAction>
            )
          });
          break;
          
        case EventType.CONTENT_PUBLISHED:
          toast({
            title: "Novo conteúdo disponível!",
            description: data.payload.title,
            variant: "default",
            action: (
              <ToastAction altText="Ver agora" onClick={() => window.location.href = `/conteudo/${data.payload.slug}`}>
                Ver agora
              </ToastAction>
            )
          });
          break;
          
        case EventType.SURVEY_PUBLISHED:
          toast({
            title: "Nova pesquisa disponível!",
            description: `Responda e ganhe ${data.payload.reward} moedas!`,
            variant: "default",
            action: (
              <ToastAction altText="Responder" onClick={() => window.location.href = "/pesquisas"}>
                Responder
              </ToastAction>
            )
          });
          break;
          
        case EventType.MATCH_CREATED:
          toast({
            title: "Nova partida agendada!",
            description: `${data.payload.teamA} vs ${data.payload.teamB}`,
            variant: "default",
            action: (
              <ToastAction altText="Ver detalhes" onClick={() => window.location.href = "/agenda"}>
                Ver detalhes
              </ToastAction>
            )
          });
          break;
          
        case EventType.STREAM_ONLINE:
          toast({
            title: "FURIA está ao vivo!",
            description: data.payload.title,
            variant: "default",
            action: (
              <ToastAction altText="Assistir agora" onClick={() => window.location.href = "/ao-vivo"}>
                Assistir agora
              </ToastAction>
            )
          });
          break;
      }
    };
    
    // Registra o handler para todos os eventos
    client.on('all', handleAllEvents);
    
    // Limpar ao desmontar
    return () => {
      client.off('all', handleAllEvents);
    };
  }, [client, toast]);
  
  // Criar o valor do contexto
  const contextValue: WebSocketContextType = {
    client,
    isConnected,
    isAuthenticated,
    lastEvent
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook para usar o WebSocket
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error("useWebSocketContext deve ser usado dentro de WebSocketProvider");
  }
  
  return context;
};