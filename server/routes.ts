import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertUserProfileSchema, insertUserPreferencesSchema, insertSurveyResponseSchema } from "@shared/schema";
import { adminRouter } from "./admin-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  const { requireAuth } = setupAuth(app);
  
  // Rota para redefinir a senha do usuário de teste (apenas para desenvolvimento)
  app.post("/api/dev/reset-test-user", async (req, res) => {
    try {
      const testUser = await storage.getUserByPrimaryIdentity("teste@furia.com");
      if (!testUser) {
        return res.status(404).json({ message: "Usuário de teste não encontrado" });
      }
      
      const newPasswordHash = await hashPassword("furiafan123");
      
      await storage.updateUser(testUser.id, {
        passwordHash: newPasswordHash,
      });
      
      res.json({ 
        message: "Senha do usuário teste redefinida com sucesso",
        email: "teste@furia.com",
        password: "furiafan123"
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });
  
  // API routes
  // All routes are prefixed with /api
  
  // User Profile routes
  app.get("/api/users/me/profile", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const profile = await storage.getUserProfile(userId);
    res.json(profile || {});
  });
  
  app.put("/api/users/me/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      
      let profile = await storage.getUserProfile(userId);
      if (profile) {
        profile = await storage.updateUserProfile(userId, validatedData);
      } else {
        profile = await storage.createUserProfile(userId, validatedData);
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", details: error.format() });
      }
      throw error;
    }
  });
  
  // Avatar update endpoint
  app.post("/api/users/me/avatar", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      // Validate that avatar URL is provided
      if (!req.body.avatarUrl) {
        return res.status(400).json({ message: "URL da imagem de avatar é obrigatória" });
      }
      
      // Update only the avatar URL
      const profile = await storage.getUserProfile(userId);
      if (profile) {
        const updatedProfile = await storage.updateUserProfile(userId, { 
          avatarUrl: req.body.avatarUrl 
        });
        res.json(updatedProfile);
      } else {
        // Create profile if it doesn't exist
        const newProfile = await storage.createUserProfile(userId, {
          firstName: null,
          lastName: null,
          birthDate: null,
          cpfEncrypted: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressCity: null,
          addressState: null,
          addressZipCode: null,
          interests: null,
          activitiesEvents: null,
          avatarUrl: req.body.avatarUrl
        });
        res.json(newProfile);
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Erro ao atualizar avatar" });
    }
  });
  
  // User Preferences routes
  app.get("/api/users/me/preferences", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const preferences = await storage.getUserPreferences(userId);
    res.json(preferences || {});
  });
  
  app.put("/api/users/me/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      const validatedData = insertUserPreferencesSchema.partial().parse(req.body);
      
      let preferences = await storage.getUserPreferences(userId);
      if (preferences) {
        preferences = await storage.updateUserPreferences(userId, validatedData);
      } else {
        preferences = await storage.createUserPreferences(userId, validatedData);
      }
      
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", details: error.format() });
      }
      throw error;
    }
  });
  
  // Social Links routes
  app.get("/api/users/me/social-links", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const socialLinks = await storage.getSocialLinks(userId);
    res.json(socialLinks);
  });
  
  // WebSocket authentication route
  app.post("/api/ws/auth", requireAuth, (req, res) => {
    // Se o usuário está autenticado, gerar token para WS
    // Na prática, estamos apenas retornando sucesso, pois a autenticação
    // já está sendo feita pelo cookie de sessão
    res.json({ 
      success: true, 
      message: "WebSocket authentication successful" 
    });
  });
  
  // Esports Profiles routes
  app.get("/api/users/me/esports-profiles", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const profiles = await storage.getEsportsProfiles(userId);
    res.json(profiles);
  });
  
  // Coin Balance routes
  app.get("/api/users/me/coin-balance", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    let balance = await storage.getCoinBalance(userId);
    
    if (!balance) {
      balance = await storage.createCoinBalance(userId);
    }
    
    res.json(balance);
  });
  
  // Coin Transactions routes
  app.get("/api/users/me/coin-transactions", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const offset = (page - 1) * (limit || 10);
    
    // Get all transactions for this user
    const allTransactions = await storage.getCoinTransactions(userId);
    
    // Calculate total pages
    const totalItems = allTransactions.length;
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;
    
    // Get paginated transactions
    const transactions = limit ? allTransactions.slice(offset, offset + limit) : allTransactions;
    
    res.json({
      data: transactions,
      pagination: {
        page,
        limit: limit || totalItems,
        totalItems,
        totalPages
      }
    });
  });
  
  // Shop Item routes
  app.get("/api/shop/items", async (req, res) => {
    const isActive = req.query.active === "true" ? true : undefined;
    const items = await storage.getShopItems({ isActive });
    res.json(items);
  });
  
  app.get("/api/shop/items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.getShopItem(id);
    
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.json(item);
  });
  
  // Redemption routes
  app.get("/api/users/me/redemptions", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const redemptions = await storage.getRedemptionOrders(userId);
    res.json(redemptions);
  });
  
  // Teste de WebSocket - envia uma notificação para todos os clientes conectados
  app.post("/api/broadcast-test", requireAuth, (req, res) => {
    try {
      const { type, payload } = req.body;
      
      if (!type) {
        return res.status(400).json({ message: "O tipo de mensagem é obrigatório" });
      }
      
      // Obter o gerenciador WebSocket
      const wsManager = global.getWebSocketManager();
      
      // Enviar mensagem para todos os clientes conectados
      wsManager.broadcast(type, payload || {});
      
      res.json({ 
        success: true, 
        message: `Mensagem do tipo '${type}' enviada para ${wsManager.server.clients.size} cliente(s)` 
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem broadcast:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem broadcast" });
    }
  });
  
  app.post("/api/redemptions", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      const { shopItemId, quantity = 1 } = req.body;
      
      // Validate input
      if (!shopItemId) {
        return res.status(400).json({ message: "ID do item é obrigatório" });
      }
      
      // Check if item exists
      const item = await storage.getShopItem(parseInt(shopItemId));
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      // Check if item is active
      if (!item.isActive) {
        return res.status(400).json({ message: "Este item não está disponível para resgate" });
      }
      
      // Check stock
      if (item.stock !== null && item.stock < quantity) {
        return res.status(400).json({ message: "Estoque insuficiente" });
      }
      
      // Calculate total cost
      const totalCost = item.coinPrice * quantity;
      
      // Check if user has enough coins
      const coinBalance = await storage.getCoinBalance(userId);
      if (!coinBalance || coinBalance.balance < totalCost) {
        return res.status(400).json({ message: "Saldo de moedas insuficiente" });
      }
      
      // Create redemption order
      const order = await storage.createRedemptionOrder(userId, {
        userId,
        shopItemId: item.id,
        quantity,
        coinCost: totalCost,
        status: "pending",
        shippingData: null,
        fulfillmentData: null
      });
      
      // Deduct coins from user's balance
      await storage.createCoinTransaction(userId, {
        userId,
        amount: -totalCost,
        transactionType: "redemption",
        description: `Resgate de "${item.name}" (${quantity}x)`,
        relatedEntityType: "redemption",
        relatedEntityId: order.id
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", details: error.format() });
      }
      throw error;
    }
  });
  
  // News Content routes
  app.get("/api/content/news", async (req, res) => {
    const isPublished = true; // Only published news for public API
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const news = await storage.getNewsContent({ isPublished, category, limit });
    res.json(news);
  });
  
  app.get("/api/content/news/:slug", async (req, res) => {
    const slug = req.params.slug;
    const content = await storage.getNewsContentBySlug(slug);
    
    if (!content || !content.isPublished) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }
    
    res.json(content);
  });
  
  // Match routes
  app.get("/api/matches", async (req, res) => {
    const status = req.query.status as string | undefined;
    const game = req.query.game as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const matches = await storage.getMatches({ status, game, limit });
    res.json(matches);
  });
  
  app.get("/api/matches/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const match = await storage.getMatch(id);
    
    if (!match) {
      return res.status(404).json({ message: "Partida não encontrada" });
    }
    
    res.json(match);
  });
  
  // Stream routes
  app.get("/api/streams", async (req, res) => {
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const streams = await storage.getStreams({ status, limit });
    res.json(streams);
  });
  
  // Survey routes
  app.get("/api/surveys", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const status = req.query.status as string | undefined;
    const responded = req.query.responded === "true" ? true : 
                      req.query.responded === "false" ? false : undefined;
    
    const surveys = await storage.getSurveys({ status, userId, responded });
    res.json(surveys);
  });
  
  app.get("/api/surveys/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const survey = await storage.getSurvey(id);
    
    if (!survey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }
    
    res.json(survey);
  });
  
  app.get("/api/surveys/:id/questions", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const survey = await storage.getSurvey(id);
    
    if (!survey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }
    
    const questions = await storage.getSurveyQuestions(id);
    res.json(questions);
  });
  
  app.post("/api/surveys/:id/responses", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      
      const surveyId = parseInt(req.params.id);
      
      // Check if survey exists
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Pesquisa não encontrada" });
      }
      
      // Check if survey is active
      if (survey.status !== "active") {
        return res.status(400).json({ message: "Esta pesquisa não está ativa" });
      }
      
      // Check if survey has expired
      if (survey.expirationDate && new Date() > survey.expirationDate) {
        return res.status(400).json({ message: "Esta pesquisa expirou" });
      }
      
      // Check if user has already responded
      const hasResponded = await storage.hasUserRespondedToSurvey(userId, surveyId);
      if (hasResponded) {
        return res.status(400).json({ message: "Você já respondeu a esta pesquisa" });
      }
      
      // Validate responses
      const validatedData = insertSurveyResponseSchema.parse({
        surveyId,
        userId,
        responses: req.body.responses
      });
      
      // Create response
      const response = await storage.createSurveyResponse(validatedData);
      
      // Add reward to user's account
      if (survey.reward > 0) {
        await storage.createCoinTransaction(userId, {
          userId,
          amount: survey.reward,
          transactionType: "survey_reward",
          description: `Recompensa por completar a pesquisa: ${survey.title}`,
          relatedEntityType: "survey",
          relatedEntityId: surveyId
        });
        
        // Update user's coin balance
        const currentBalance = await storage.getCoinBalance(userId);
        if (currentBalance) {
          await storage.updateCoinBalance(userId, currentBalance.balance + survey.reward);
        }
      }
      
      res.status(201).json({
        id: response.id,
        surveyId: response.surveyId,
        completedAt: response.completedAt,
        reward: survey.reward
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", details: error.format() });
      }
      throw error;
    }
  });
  
  app.get("/api/users/me/survey-responses", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const responses = await storage.getUserSurveyResponses(userId);
    res.json(responses);
  });
  
  // Roteador de administração - rotas prefixadas com /api/admin
  app.use("/api/admin", adminRouter);
  
  // Initialize HTTP server
  const httpServer = createServer(app);
  
  // Initialize WebSocket server on a distinct path to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      payload: { message: 'Conexão WebSocket estabelecida com QG FURIOSO' },
      timestamp: Date.now()
    }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({
              type: 'pong',
              payload: { timestamp: Date.now() },
              timestamp: Date.now()
            }));
            break;
          
          case 'authenticate':
            // In a real app, we would validate the session/token here
            ws.send(JSON.stringify({
              type: 'auth_success',
              payload: { message: 'Autenticado com sucesso' },
              timestamp: Date.now()
            }));
            break;
            
          default:
            console.log(`Unhandled message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Store wss to make it accessible from other modules
  global.webSocketServer = wss;
  
  // Function to broadcast a message to all connected clients
  const broadcastMessage = (type: string, payload: any) => {
    if (!wss) return;
    
    const message = JSON.stringify({
      type,
      payload,
      timestamp: Date.now()
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Helper function to get WebSocket manager for other modules
  global.getWebSocketManager = () => ({
    broadcast: broadcastMessage,
    server: wss
  });
  
  return httpServer;
}
