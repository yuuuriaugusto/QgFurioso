import { apiRequest } from './api';

// Importando tipos do backend
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

// Tipo para callbacks de eventos
type EventCallback = (payload: any) => void;

/**
 * Cliente WebSocket para a plataforma QG FURIOSO
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private clientId: string = '';
  private isConnected: boolean = false;
  private isAuthenticated: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000; // Começa com 2 segundos
  private pingInterval: number | null = null;
  private eventListeners: Map<EventType, EventCallback[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
  /**
   * Inicializa e conecta ao servidor WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Gerar um ID de cliente único
        this.clientId = this.generateClientId();
        
        // Determinar URL do WebSocket (WS ou WSS dependendo do protocolo atual)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`[WebSocket] Conectando a ${wsUrl}`);
        
        // Criar nova conexão WebSocket
        this.socket = new WebSocket(wsUrl);
        
        // Configurar handlers de eventos
        this.socket.onopen = () => {
          console.log('[WebSocket] Conexão estabelecida');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectTimeout = 2000; // Resetar timeout para o padrão
          
          // Iniciar ping periódico para manter conexão viva
          this.startPingInterval();
          
          resolve();
        };
        
        this.socket.onclose = (event) => {
          console.log(`[WebSocket] Conexão fechada: ${event.code} - ${event.reason}`);
          this.isConnected = false;
          this.isAuthenticated = false;
          
          // Limpar timers
          this.clearTimers();
          
          // Tentar reconectar automaticamente
          this.scheduleReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('[WebSocket] Erro na conexão:', error);
          if (!this.isConnected) {
            reject(error);
          }
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Erro ao processar mensagem:', error);
          }
        };
      } catch (error) {
        console.error('[WebSocket] Erro ao estabelecer conexão:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Autentica a conexão com o servidor
   */
  public async authenticate(): Promise<boolean> {
    if (!this.isConnected || !this.socket) {
      console.error('[WebSocket] Não é possível autenticar: não conectado');
      return false;
    }
    
    try {
      // Enviar solicitação de autenticação para o servidor
      const response = await apiRequest('POST', '/api/ws/auth', {
        clientId: this.clientId
      });
      
      if (response.ok) {
        this.isAuthenticated = true;
        console.log('[WebSocket] Autenticado com sucesso');
        return true;
      } else {
        console.error('[WebSocket] Falha na autenticação:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('[WebSocket] Erro durante autenticação:', error);
      return false;
    }
  }
  
  /**
   * Fecha a conexão com o servidor
   */
  public disconnect(): void {
    this.clearTimers();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isAuthenticated = false;
  }
  
  /**
   * Adiciona um listener para um tipo específico de evento
   */
  public on(event: EventType, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(callback);
    }
  }
  
  /**
   * Remove um listener específico para um tipo de evento
   */
  public off(event: EventType, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.eventListeners.delete(event);
    }
  }
  
  /**
   * Envia uma mensagem para o servidor
   */
  public send(type: EventType, payload: any = {}): boolean {
    if (!this.isConnected || !this.socket) {
      console.error('[WebSocket] Não é possível enviar mensagem: não conectado');
      return false;
    }
    
    try {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now()
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Erro ao enviar mensagem:', error);
      return false;
    }
  }
  
  /**
   * Verifica se a conexão está estabelecida
   */
  public isConnectedAndReady(): boolean {
    return this.isConnected && !!this.socket;
  }
  
  /**
   * Verifica se a conexão está autenticada
   */
  public isAuthenticatedAndReady(): boolean {
    return this.isConnected && this.isAuthenticated && !!this.socket;
  }
  
  /**
   * Manipula mensagens recebidas do servidor
   */
  private handleMessage(message: WebSocketMessage): void {
    // Processar mensagens do sistema primeiro
    switch (message.type) {
      case EventType.PONG:
        // Recebemos pong do servidor, conexão está viva
        return;
        
      case EventType.ERROR:
        console.error('[WebSocket] Erro recebido do servidor:', message.payload);
        break;
    }
    
    // Disparar callbacks para este tipo de evento
    const listeners = this.eventListeners.get(message.type);
    if (listeners && listeners.length > 0) {
      for (const callback of listeners) {
        try {
          callback(message.payload);
        } catch (error) {
          console.error(`[WebSocket] Erro no callback para evento ${message.type}:`, error);
        }
      }
    }
  }
  
  /**
   * Inicia o intervalo para enviar ping
   */
  private startPingInterval(): void {
    this.clearTimers();
    
    // Enviar ping a cada 25 segundos para manter a conexão viva
    this.pingInterval = window.setInterval(() => {
      if (this.isConnected && this.socket) {
        this.send(EventType.PING, { timestamp: Date.now() });
      }
    }, 25000);
  }
  
  /**
   * Agenda uma tentativa de reconexão
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Máximo de tentativas de reconexão atingido');
      return;
    }
    
    this.reconnectAttempts++;
    
    // Usar backoff exponencial para evitar sobrecarregar o servidor
    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`[WebSocket] Tentando reconectar em ${Math.round(timeout / 1000)} segundos...`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`[WebSocket] Tentativa de reconexão ${this.reconnectAttempts} de ${this.maxReconnectAttempts}`);
      this.connect()
        .then(() => {
          // Reconexão bem sucedida, tentar autenticar novamente
          if (this.isAuthenticated) {
            this.authenticate()
              .catch(error => console.error('[WebSocket] Erro ao reautenticar após reconexão:', error));
          }
        })
        .catch(error => {
          console.error('[WebSocket] Falha na reconexão:', error);
          // A próxima reconexão será agendada pelo evento onclose
        });
    }, timeout);
  }
  
  /**
   * Limpa todos os timers
   */
  private clearTimers(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Gera um ID de cliente único
   */
  private generateClientId(): string {
    return 'ws-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Singleton para uso global
let websocketClient: WebSocketClient | null = null;

/**
 * Obter instância do cliente WebSocket
 */
export function getWebSocketClient(): WebSocketClient {
  if (!websocketClient) {
    websocketClient = new WebSocketClient();
  }
  
  return websocketClient;
}