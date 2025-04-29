import { Router } from 'express';
import { getWebSocketManager, EventType } from './websocket-server';

// Rotas para testes de WebSocket
export const wsTestRouter = Router();

// Rota para enviar uma mensagem para um cliente específico
wsTestRouter.post('/send-to-client', (req, res) => {
  const { clientId, type, payload } = req.body;
  
  if (!clientId || !type) {
    return res.status(400).json({ 
      message: 'clientId e type são obrigatórios' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  try {
    wsManager.sendToClient(clientId, {
      type: type as EventType,
      payload: payload || {},
      timestamp: Date.now()
    });
    
    res.status(200).json({ 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para o cliente:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar mensagem para o cliente', 
      error: (error as Error).message 
    });
  }
});

// Rota para enviar uma mensagem para um usuário específico
wsTestRouter.post('/send-to-user', (req, res) => {
  const { userId, type, payload } = req.body;
  
  if (!userId || !type) {
    return res.status(400).json({ 
      message: 'userId e type são obrigatórios' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  try {
    wsManager.sendToUser(userId, {
      type: type as EventType,
      payload: payload || {},
      timestamp: Date.now()
    });
    
    res.status(200).json({ 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para o usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar mensagem para o usuário', 
      error: (error as Error).message 
    });
  }
});

// Rota para enviar uma mensagem para um canal específico
wsTestRouter.post('/send-to-channel', (req, res) => {
  const { channel, type, payload } = req.body;
  
  if (!channel || !type) {
    return res.status(400).json({ 
      message: 'channel e type são obrigatórios' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  try {
    wsManager.sendToChannel(channel, {
      type: type as EventType,
      payload: payload || {},
      timestamp: Date.now()
    });
    
    res.status(200).json({ 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para o canal:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar mensagem para o canal', 
      error: (error as Error).message 
    });
  }
});

// Rota para enviar uma mensagem para todos os clientes (broadcast)
wsTestRouter.post('/broadcast', (req, res) => {
  const { type, payload } = req.body;
  
  if (!type) {
    return res.status(400).json({ 
      message: 'type é obrigatório' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  try {
    wsManager.broadcast({
      type: type as EventType,
      payload: payload || {},
      timestamp: Date.now()
    });
    
    res.status(200).json({ 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar broadcast:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar broadcast', 
      error: (error as Error).message 
    });
  }
});

// Simuladores de eventos
// Rota para simular um novo conteúdo publicado
wsTestRouter.post('/simulate/content', (req, res) => {
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const mockContent = {
    id: Date.now(),
    title: "Novo artigo exclusivo da FURIA",
    slug: `novo-artigo-${Date.now()}`,
    summary: "Este é um novo artigo exclusivo com atualizações sobre o time da FURIA",
    imageUrl: "https://placehold.co/600x400?text=FURIA+News",
    category: "news",
    publishedAt: new Date().toISOString()
  };
  
  wsManager.broadcast({
    type: EventType.CONTENT_PUBLISHED,
    payload: mockContent,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de conteúdo simulado com sucesso',
    content: mockContent
  });
});

// Rota para simular uma atualização de partida
wsTestRouter.post('/simulate/match', (req, res) => {
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const mockMatch = {
    id: Date.now(),
    game: "CS2",
    homeTeam: "FURIA",
    awayTeam: "Team Liquid",
    status: "live",
    score: {
      home: Math.floor(Math.random() * 16),
      away: Math.floor(Math.random() * 16)
    },
    startTime: new Date().toISOString(),
    streamUrl: "https://twitch.tv/furia"
  };
  
  wsManager.broadcast({
    type: EventType.MATCH_UPDATED,
    payload: mockMatch,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de partida simulado com sucesso',
    match: mockMatch
  });
});

// Rota para simular uma transmissão iniciada
wsTestRouter.post('/simulate/stream', (req, res) => {
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const mockStream = {
    id: Date.now(),
    title: "FURIA Live - Treino de CS2",
    streamerName: "FURIA TV",
    game: "CS2",
    thumbnailUrl: "https://placehold.co/600x400?text=FURIA+Stream",
    viewerCount: Math.floor(Math.random() * 10000) + 1000,
    streamUrl: "https://twitch.tv/furia",
    startedAt: new Date().toISOString()
  };
  
  wsManager.broadcast({
    type: EventType.STREAM_ONLINE,
    payload: mockStream,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de stream simulado com sucesso',
    stream: mockStream
  });
});

// Rota para simular um novo item na loja
wsTestRouter.post('/simulate/shop-item', (req, res) => {
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const mockItem = {
    id: Date.now(),
    name: "Camiseta Exclusiva FURIA 2025",
    description: "Edição limitada da camiseta oficial da FURIA para a temporada 2025",
    imageUrl: "https://placehold.co/600x400?text=FURIA+Shop",
    coinPrice: Math.floor(Math.random() * 1000) + 500,
    isActive: true,
    stock: Math.floor(Math.random() * 100) + 10,
    category: "apparel"
  };
  
  wsManager.broadcast({
    type: EventType.SHOP_ITEM_ADDED,
    payload: mockItem,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de novo item na loja simulado com sucesso',
    item: mockItem
  });
});

// Rota para simular uma recompensa recebida
wsTestRouter.post('/simulate/reward/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ 
      message: 'userId é obrigatório' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const mockReward = {
    id: Date.now(),
    amount: Math.floor(Math.random() * 100) + 10,
    reason: "Recompensa por login diário",
    timestamp: Date.now()
  };
  
  wsManager.sendToUser(parseInt(userId), {
    type: EventType.REWARD_EARNED,
    payload: mockReward,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de recompensa simulado com sucesso',
    reward: mockReward
  });
});

// Rota para simular um status de resgate atualizado
wsTestRouter.post('/simulate/redemption/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ 
      message: 'userId é obrigatório' 
    });
  }
  
  const wsManager = getWebSocketManager();
  if (!wsManager) {
    return res.status(500).json({ 
      message: 'Servidor WebSocket não inicializado' 
    });
  }
  
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const mockRedemption = {
    id: Date.now(),
    itemName: "Camiseta FURIA",
    status: randomStatus,
    updatedAt: new Date().toISOString()
  };
  
  wsManager.sendToUser(parseInt(userId), {
    type: EventType.REDEMPTION_STATUS_CHANGED,
    payload: mockRedemption,
    timestamp: Date.now()
  });
  
  res.status(200).json({ 
    message: 'Evento de status de resgate simulado com sucesso',
    redemption: mockRedemption
  });
});

export default wsTestRouter;