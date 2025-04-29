import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { randomUUID } from 'crypto';

// Tipos de eventos do sistema
export enum EventType {
  // Eventos de conteúdo
  CONTENT_PUBLISHED = 'content_published',
  
  // Eventos de partidas
  MATCH_CREATED = 'match_created',
  MATCH_UPDATED = 'match_updated',
  MATCH_STARTED = 'match_started',
  MATCH_ENDED = 'match_ended',
  
  // Eventos de transmissões
  STREAM_ONLINE = 'stream_online',
  STREAM_OFFLINE = 'stream_offline',
  
  // Eventos da loja
  SHOP_ITEM_ADDED = 'shop_item_added',
  SHOP_ITEM_UPDATED = 'shop_item_updated',
  
  // Eventos de pesquisas
  SURVEY_PUBLISHED = 'survey_published',
  
  // Eventos de usuário
  REWARD_EARNED = 'reward_earned',
  REDEMPTION_STATUS_CHANGED = 'redemption_status_changed',
  
  // Eventos do sistema
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error'
}

// Interface de mensagem do WebSocket
export interface WebSocketMessage {
  type: EventType;
  payload: any;
  timestamp: number;
}

// Interface para clientes conectados
interface ConnectedClient {
  id: string;
  userId?: number;
  socket: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  isAuthenticated: boolean;
  metadata?: Record<string, any>;
}

/**
 * Classe para gerenciar o servidor WebSocket
 */
export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private userClients: Map<number, Set<string>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  
  constructor(server: Server) {
    // Inicializar servidor WebSocket no caminho /ws
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });
    
    console.log('Servidor WebSocket inicializado');
    
    // Configurar eventos
    this.setupEvents();
    
    // Iniciar heartbeat para verificar conexões ativas
    this.startHeartbeat();
  }
  
  /**
   * Configura os handlers de eventos para o servidor WebSocket
   */
  private setupEvents(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      // Criar ID único para este cliente
      const clientId = randomUUID();
      
      // Adicionar cliente à lista de conexões
      this.clients.set(clientId, {
        id: clientId,
        socket: ws,
        isAlive: true,
        subscriptions: new Set(['global']), // Todos se inscrevem no canal global por padrão
        isAuthenticated: false
      });
      
      console.log(`[WebSocket] Nova conexão estabelecida: ${clientId}`);
      
      // Enviar mensagem de boas-vindas
      this.sendToClient(clientId, {
        type: EventType.PING,
        payload: { message: 'Conexão estabelecida com QG FURIOSO' },
        timestamp: Date.now()
      });
      
      // Configurar handler para mensagens do cliente
      ws.on('message', (data: string) => {
        try {
          // Processar mensagem recebida
          const message = JSON.parse(data) as WebSocketMessage;
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error(`[WebSocket] Erro ao processar mensagem: ${error}`);
          // Enviar erro para o cliente
          this.sendToClient(clientId, {
            type: EventType.ERROR,
            payload: { message: 'Formato de mensagem inválido' },
            timestamp: Date.now()
          });
        }
      });
      
      // Configurar handler para pongs (heartbeat)
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.isAlive = true;
        }
      });
      
      // Configurar handler para fechar conexão
      ws.on('close', () => {
        console.log(`[WebSocket] Conexão fechada: ${clientId}`);
        this.removeClient(clientId);
      });
      
      // Configurar handler para erros
      ws.on('error', (error) => {
        console.error(`[WebSocket] Erro na conexão ${clientId}:`, error);
        this.removeClient(clientId);
      });
    });
  }
  
  /**
   * Processa mensagens recebidas dos clientes
   */
  private handleClientMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    console.log(`[WebSocket] Mensagem recebida de ${clientId}: ${message.type}`);
    
    switch (message.type) {
      case EventType.PING:
        // Responder com pong para manter a conexão viva
        this.sendToClient(clientId, {
          type: EventType.PONG,
          payload: { message: 'pong' },
          timestamp: Date.now()
        });
        break;
        
      case EventType.PONG:
        // Atualizar status do cliente
        client.isAlive = true;
        break;
        
      default:
        // Ignorar outros tipos de mensagens por enquanto
        break;
    }
  }
  
  /**
   * Remove um cliente da lista de conexões
   */
  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Remover das listas de usuários se estiver autenticado
    if (client.userId) {
      const userClients = this.userClients.get(client.userId);
      if (userClients) {
        userClients.delete(clientId);
        // Remover o set se não houver mais clientes para este usuário
        if (userClients.size === 0) {
          this.userClients.delete(client.userId);
        }
      }
    }
    
    // Remover da lista principal
    this.clients.delete(clientId);
  }
  
  /**
   * Inicia processo de heartbeat para verificar conexões ativas
   */
  private startHeartbeat(): void {
    // Limpar intervalo existente se houver
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Verificar conexões a cada 30 segundos
    this.pingInterval = setInterval(() => {
      for (const [clientId, client] of this.clients.entries()) {
        if (!client.isAlive) {
          // Remover clientes inativos
          console.log(`[WebSocket] Removendo cliente inativo: ${clientId}`);
          client.socket.terminate();
          this.removeClient(clientId);
          continue;
        }
        
        // Resetar estado e enviar ping
        client.isAlive = false;
        
        try {
          // Enviar ping
          client.socket.ping();
        } catch (error) {
          console.error(`[WebSocket] Erro ao enviar ping para ${clientId}:`, error);
          this.removeClient(clientId);
        }
      }
    }, 30000);
  }
  
  /**
   * Registra um usuário autenticado
   */
  public authenticateClient(clientId: string, userId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Atualizar status de autenticação do cliente
    client.isAuthenticated = true;
    client.userId = userId;
    
    // Adicionar à lista de clientes do usuário
    let userClients = this.userClients.get(userId);
    if (!userClients) {
      userClients = new Set<string>();
      this.userClients.set(userId, userClients);
    }
    userClients.add(clientId);
    
    // Adicionar usuário ao canal específico
    client.subscriptions.add(`user:${userId}`);
    
    // Enviar confirmação para o cliente
    this.sendToClient(clientId, {
      type: EventType.PING,
      payload: { message: 'Autenticado com sucesso' },
      timestamp: Date.now()
    });
    
    console.log(`[WebSocket] Cliente ${clientId} autenticado como usuário ${userId}`);
  }
  
  /**
   * Envia mensagem para um cliente específico
   */
  public sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error(`[WebSocket] Erro ao enviar mensagem para ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }
  
  /**
   * Envia mensagem para todos os clientes
   */
  public broadcast(message: WebSocketMessage): void {
    for (const [clientId, client] of this.clients.entries()) {
      try {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error(`[WebSocket] Erro ao fazer broadcast para ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }
  
  /**
   * Envia mensagem para um canal específico
   */
  public sendToChannel(channel: string, message: WebSocketMessage): void {
    for (const [clientId, client] of this.clients.entries()) {
      if (client.subscriptions.has(channel)) {
        try {
          if (client.socket.readyState === WebSocket.OPEN) {
            client.socket.send(JSON.stringify(message));
          }
        } catch (error) {
          console.error(`[WebSocket] Erro ao enviar para canal ${channel}, cliente ${clientId}:`, error);
          this.removeClient(clientId);
        }
      }
    }
  }
  
  /**
   * Envia mensagem para um usuário específico (em todas as suas conexões)
   */
  public sendToUser(userId: number, message: WebSocketMessage): void {
    const userClients = this.userClients.get(userId);
    if (!userClients) return;
    
    for (const clientId of userClients) {
      this.sendToClient(clientId, message);
    }
  }
  
  /**
   * Fecha o servidor e limpa recursos
   */
  public close(): void {
    // Limpar intervalo de heartbeat
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Fechar todas as conexões
    for (const [clientId, client] of this.clients.entries()) {
      try {
        client.socket.close();
      } catch (error) {
        console.error(`[WebSocket] Erro ao fechar conexão ${clientId}:`, error);
      }
    }
    
    // Limpar coleções
    this.clients.clear();
    this.userClients.clear();
    
    // Fechar servidor
    this.wss.close();
    
    console.log('[WebSocket] Servidor fechado');
  }
}

// Singleton para acesso global
let websocketManager: WebSocketManager | null = null;

/**
 * Inicializa o servidor WebSocket
 */
export function initializeWebSocketServer(server: Server): WebSocketManager {
  if (websocketManager) {
    return websocketManager;
  }
  
  websocketManager = new WebSocketManager(server);
  return websocketManager;
}

/**
 * Obtém a instância do gerenciador de WebSocket
 */
export function getWebSocketManager(): WebSocketManager | null {
  return websocketManager;
}