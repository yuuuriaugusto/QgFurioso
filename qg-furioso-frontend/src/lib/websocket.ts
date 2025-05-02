// WebSocket client para o QG FURIOSO
// Este módulo gerencia a conexão WebSocket e a autenticação

// Tipos de eventos disponíveis na aplicação
export enum EventType {
  // Eventos do sistema
  PING = 'ping',
  PONG = 'pong',
  CONNECTION_ESTABLISHED = 'connection_established',
  
  // Eventos de autenticação
  AUTHENTICATE = 'authenticate',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  
  // Eventos de negócio
  REWARD_EARNED = 'reward_earned',
  REDEMPTION_STATUS_CHANGED = 'redemption_status_changed',
  CONTENT_PUBLISHED = 'content_published',
  SURVEY_PUBLISHED = 'survey_published',
  MATCH_CREATED = 'match_created',
  STREAM_ONLINE = 'stream_online',
}

// Interface para mensagens WebSocket
export interface WebSocketMessage {
  type: EventType | string;
  payload: any;
  timestamp: number;
}

// Tipo para o handler de eventos WebSocket
export type EventHandler = (payload: any) => void;

// Classe que gerencia a conexão WebSocket
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000; // 5 segundos
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private authToken: string | null = null;
  
  constructor() {
    // Determina o URL correto do WebSocket com base no protocolo atual
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
  }
  
  // Conecta ao servidor WebSocket
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log('WebSocket já está conectado ou conectando');
      return;
    }
    
    // Limpa qualquer tentativa anterior de reconexão
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    try {
      this.socket = new WebSocket(this.url);
      
      // Configura os handlers de eventos
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      console.log('Conectando ao WebSocket:', this.url);
    } catch (error) {
      console.error('Erro ao conectar ao WebSocket:', error);
      this.scheduleReconnect();
    }
  }
  
  // Desconecta do servidor WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  // Verifica se está conectado
  isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  // Define o token de autenticação
  setAuthToken(token: string): void {
    this.authToken = token;
  }
  
  // Tenta autenticar com o servidor
  authenticate(): void {
    if (!this.isConnected()) {
      console.error('WebSocket não está conectado');
      return;
    }
    
    this.send(EventType.AUTHENTICATE, { token: this.authToken });
  }
  
  // Envia uma mensagem para o servidor
  send(type: EventType | string, payload: any = {}): void {
    if (!this.isConnected()) {
      console.error('Tentativa de enviar mensagem sem conexão WebSocket');
      return;
    }
    
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now()
    };
    
    try {
      this.socket?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Erro ao enviar mensagem WebSocket:', error);
    }
  }
  
  // Registra um handler para um tipo específico de evento
  on(eventType: EventType | string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)?.add(handler);
  }
  
  // Remove um handler para um tipo específico de evento
  off(eventType: EventType | string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }
  
  // Handler para evento de conexão aberta
  private handleOpen(event: Event): void {
    console.log('WebSocket conectado com sucesso');
    
    // Notifica todos os handlers interessados na conexão
    this.notifyHandlers(EventType.CONNECTION_ESTABLISHED, {
      connected: true,
      timestamp: Date.now()
    });
  }
  
  // Handler para mensagens recebidas
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      console.log('Mensagem WebSocket recebida:', message);
      
      // Emite evento para os handlers registrados
      this.notifyHandlers(message.type, message.payload);
      
      // Responde a mensagens do sistema
      if (message.type === EventType.PING) {
        this.send(EventType.PONG, { timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  }
  
  // Handler para fechamento da conexão
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket desconectado: ${event.code} - ${event.reason}`);
    
    // Limpa o socket
    this.socket = null;
    
    // Tenta reconectar
    this.scheduleReconnect();
  }
  
  // Handler para erros de conexão
  private handleError(event: Event): void {
    console.error('Erro na conexão WebSocket:', event);
  }
  
  // Agenda uma tentativa de reconexão
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Tentando reconectar ao WebSocket...');
      this.connect();
    }, this.reconnectInterval);
  }
  
  // Notifica todos os handlers registrados para um tipo de evento
  private notifyHandlers(eventType: EventType | string, payload: any): void {
    const handlers = this.eventHandlers.get(eventType);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Erro ao executar handler para evento ${eventType}:`, error);
        }
      });
    }
    
    // Notifica também handlers de "all" para qualquer evento
    const allHandlers = this.eventHandlers.get('all');
    
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler({ type: eventType, payload });
        } catch (error) {
          console.error(`Erro ao executar handler global para evento ${eventType}:`, error);
        }
      });
    }
  }
}