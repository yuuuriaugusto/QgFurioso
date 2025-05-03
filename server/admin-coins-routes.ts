import { Router, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { logAuditAction } from './audit-routes';
import { requireAdminAuth, requireAdminRole } from './admin-routes';

export const adminCoinsRouter = Router();

// Middleware para verificar permissões relacionadas a FURIA Coins
const requireCoinsPermission = [requireAdminAuth, requireAdminRole(['admin', 'finance'])];

// Rota para obter regras de pontuação
adminCoinsRouter.get('/rules', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    
    // Validação de parâmetros
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parâmetros de paginação inválidos' });
    }
    
    // Implementação para chamar o storage real quando disponível
    // Por enquanto retornarmos uma mensagem de não implementado

    // Log de auditoria
    await logAuditAction(req, 'read', 'coin_rule', null, 'Consultou regras de pontuação');
    
    // Em vez de retornar 501, vamos retornar dados mockados para desenvolvimento
    // Retornar 200 com dados mockados para desenvolvimento
    return res.status(200).json({
      rules: [
        {
          id: 1,
          title: "Cadastro Completo",
          description: "Pontos concedidos quando o usuário completa todas as informações do perfil.",
          pointsAmount: 50,
          category: "profile",
          isActive: true,
          createdAt: "2023-01-10T14:30:00Z",
          updatedAt: "2023-01-10T14:30:00Z",
          isRecurring: false,
          cooldownHours: null,
          maxOccurrences: 1
        },
        {
          id: 2,
          title: "Login Diário",
          description: "Pontos concedidos pelo primeiro login do dia na plataforma.",
          pointsAmount: 10,
          category: "engagement",
          isActive: true,
          createdAt: "2023-01-11T09:45:00Z",
          updatedAt: "2023-02-15T11:20:00Z",
          isRecurring: true,
          cooldownHours: 24,
          maxOccurrences: null
        },
        {
          id: 3,
          title: "Responder Pesquisa",
          description: "Pontos concedidos quando o usuário responde uma pesquisa completa.",
          pointsAmount: 25,
          category: "surveys",
          isActive: true,
          createdAt: "2023-01-15T16:20:00Z",
          updatedAt: "2023-01-15T16:20:00Z",
          isRecurring: true,
          cooldownHours: null,
          maxOccurrences: null
        }
      ],
      totalCount: 3,
      pageCount: 1
    });
  } catch (error) {
    console.error('Erro ao buscar regras de pontuação:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Rota para criar uma nova regra de pontuação
adminCoinsRouter.post('/rules', requireCoinsPermission, async (req: Request, res: Response) => {
  try {
    // Validação de dados
    const { title, description, pointsAmount, category, isActive, isRecurring, cooldownHours, maxOccurrences } = req.body;
    
    if (!title || !description || pointsAmount === undefined || !category) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(req, 'create', 'coin_rule', null, `Criou regra de pontuação: ${title}`);
    
    return res.status(501).json({ message: 'Endpoint em implementação' });
  } catch (error) {
    console.error('Erro ao criar regra de pontuação:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Rota para atualizar uma regra de pontuação
adminCoinsRouter.put('/rules/:id', requireCoinsPermission, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    
    if (isNaN(ruleId)) {
      return res.status(400).json({ message: 'ID de regra inválido' });
    }
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(req, 'update', 'coin_rule', ruleId.toString(), `Atualizou regra de pontuação #${ruleId}`);
    
    return res.status(501).json({ message: 'Endpoint em implementação' });
  } catch (error) {
    console.error('Erro ao atualizar regra de pontuação:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Rota para obter transações de FURIA Coins
adminCoinsRouter.get('/transactions', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const amountType = req.query.amountType as 'positive' | 'negative';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Validação de parâmetros
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parâmetros de paginação inválidos' });
    }
    
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({ message: 'Período de datas inválido' });
    }
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(req, 'read', 'coin_transaction', null, 'Consultou transações de FURIA Coins');
    
    // Retornar dados mockados para desenvolvimento
    const mockTransactions = [
      {
        id: 1,
        transactionId: "TRX-2023-0001",
        userId: 1,
        userName: "João Silva",
        userEmail: "joao.silva@exemplo.com",
        amount: 50,
        balance: 50,
        transactionType: "signup_bonus",
        description: "Bônus de cadastro",
        metadata: null,
        referenceId: null,
        createdAt: "2023-04-28T14:30:00Z",
        updatedAt: "2023-04-28T14:30:00Z"
      },
      {
        id: 2,
        transactionId: "TRX-2023-0002",
        userId: 2,
        userName: "Maria Santos",
        userEmail: "maria.santos@exemplo.com",
        amount: 10,
        balance: 60,
        transactionType: "daily_login",
        description: "Login diário",
        metadata: null,
        referenceId: null,
        createdAt: "2023-04-27T09:45:00Z",
        updatedAt: "2023-04-27T09:45:00Z"
      },
      {
        id: 3,
        transactionId: "TRX-2023-0003",
        userId: 1,
        userName: "João Silva",
        userEmail: "joao.silva@exemplo.com",
        amount: 25,
        balance: 75,
        transactionType: "survey_completion",
        description: "Resposta à pesquisa #12: Preferências de jogo",
        metadata: {
          surveyId: 12,
          surveyTitle: "Preferências de jogo"
        },
        referenceId: "SURVEY-12",
        createdAt: "2023-04-26T16:20:00Z",
        updatedAt: "2023-04-26T16:20:00Z"
      },
      {
        id: 4,
        transactionId: "TRX-2023-0004",
        userId: 3,
        userName: "Carlos Oliveira",
        userEmail: "carlos.oliveira@exemplo.com",
        amount: -500,
        balance: 50,
        transactionType: "redemption",
        description: "Resgate de produto: Camisa FURIA Oficial",
        metadata: {
          productId: 1,
          productName: "Camisa FURIA Oficial",
          redemptionId: "ORD-2023-0001"
        },
        referenceId: "ORD-2023-0001",
        createdAt: "2023-04-25T13:15:00Z",
        updatedAt: "2023-04-25T13:15:00Z"
      }
    ];
    
    // Filtrar transações conforme parâmetros recebidos
    let filteredTransactions = [...mockTransactions];
    
    // Filtrar por tipo de transação
    if (type && type !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.transactionType === type);
    }
    
    // Filtrar por valor positivo/negativo
    if (amountType === 'positive') {
      filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
    } else if (amountType === 'negative') {
      filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
    }
    
    // Filtrar por data
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const txDate = new Date(t.createdAt);
        if (startDate && endDate) {
          return txDate >= startDate && txDate <= endDate;
        } else if (startDate) {
          return txDate >= startDate;
        } else if (endDate) {
          return txDate <= endDate;
        }
        return true;
      });
    }
    
    // Filtrar por termo de busca
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(t => 
        t.userName.toLowerCase().includes(searchTerm) || 
        t.userEmail.toLowerCase().includes(searchTerm) ||
        t.transactionId.toLowerCase().includes(searchTerm)
      );
    }
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    return res.status(200).json({
      transactions: paginatedTransactions,
      totalCount: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      pageCount: Math.ceil(filteredTransactions.length / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar transações de FURIA Coins:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Rota para criar um ajuste administrativo (adicionar ou remover coins)
adminCoinsRouter.post('/transactions/adjust', requireCoinsPermission, async (req: Request, res: Response) => {
  try {
    // Validação de dados
    const { userId, amount, reason } = req.body;
    
    if (!userId || amount === undefined || !reason) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(
      req, 
      'create', 
      'coin_transaction', 
      null, 
      `Realizou ajuste de ${amount} FURIA Coins para usuário #${userId}: ${reason}`
    );
    
    return res.status(501).json({ message: 'Endpoint em implementação' });
  } catch (error) {
    console.error('Erro ao criar ajuste de coins:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Rota para obter métricas de FURIA Coins
adminCoinsRouter.get('/metrics', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(req, 'read', 'coin_metrics', null, 'Consultou métricas de FURIA Coins');
    
    // Dados mockados para desenvolvimento
    const metrics = {
      totalCoinsIssued: 15000,
      totalCoinsSpent: 8500,
      activeCoinBalance: 6500,
      averageUserBalance: 124,
      mostPopularRules: [
        { rule: "Login Diário", occurrences: 452, totalAmount: 4520 },
        { rule: "Responder Pesquisa", occurrences: 156, totalAmount: 3900 },
        { rule: "Assistir Transmissão", occurrences: 284, totalAmount: 1420 }
      ],
      mostPopularRedemptions: [
        { item: "Camisa FURIA Oficial", redeemed: 32, totalAmount: 16000 },
        { item: "Emoji Exclusivo (Discord)", redeemed: 95, totalAmount: 14250 },
        { item: "Boné FURIA Especial", redeemed: 48, totalAmount: 16800 }
      ],
      dailyTransactions: [
        // Dados para um gráfico de atividade diária
        { date: "2023-04-20", issued: 320, spent: 180 },
        { date: "2023-04-21", issued: 290, spent: 210 },
        { date: "2023-04-22", issued: 350, spent: 240 },
        { date: "2023-04-23", issued: 280, spent: 260 },
        { date: "2023-04-24", issued: 420, spent: 150 },
        { date: "2023-04-25", issued: 380, spent: 290 },
        { date: "2023-04-26", issued: 450, spent: 320 }
      ]
    };
    
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas de FURIA Coins:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});

// Exportar transações como CSV
adminCoinsRouter.get('/transactions/export', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const type = req.query.type as string;
    
    // Implementação para chamar o storage real quando disponível
    
    // Log de auditoria
    await logAuditAction(req, 'export', 'coin_transaction', null, 'Exportou transações de FURIA Coins');
    
    return res.status(501).json({ message: 'Endpoint em implementação' });
  } catch (error) {
    console.error('Erro ao exportar transações:', error);
    return res.status(500).json({ message: 'Erro ao processar requisição' });
  }
});