import { Router, Request, Response, NextFunction } from 'express';
import { analyticsService, DateRange, TimeGranularity } from './analytics';
import { z } from 'zod';

// Schema de validação para parâmetros de data
const dateRangeSchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'startDate deve ser uma data válida'
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'endDate deve ser uma data válida'
  })
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'startDate deve ser anterior ou igual a endDate',
  path: ['startDate']
});

// Schema de validação para granularidade temporal
const granularitySchema = z.enum(['day', 'week', 'month']);

// Router para APIs de analytics
export const analyticsRouter = Router();

// Middleware para validar parâmetros de data em todas as rotas
const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Se não foram fornecidos, usa últimos 30 dias como padrão
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      
      req.dateRange = {
        startDate: start,
        endDate: end
      };
      return next();
    }
    
    // Valida os parâmetros fornecidos
    const validatedData = dateRangeSchema.parse({ 
      startDate: startDate as string, 
      endDate: endDate as string 
    });
    
    req.dateRange = {
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate)
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar granularidade temporal
const validateGranularity = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { granularity } = req.query;
    
    // Se não foi fornecido, usa 'day' como padrão
    if (!granularity) {
      req.granularity = 'day';
      return next();
    }
    
    // Valida o parâmetro fornecido
    const validatedGranularity = granularitySchema.parse(granularity);
    req.granularity = validatedGranularity;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Adiciona tipos para Request
declare global {
  namespace Express {
    interface Request {
      dateRange?: DateRange;
      granularity?: TimeGranularity;
    }
  }
}

// Endpoint para dashboard completo
analyticsRouter.get('/dashboard', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de atividade de usuário
analyticsRouter.get('/user-activity', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getUserActivityMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de conteúdo
analyticsRouter.get('/content', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getContentMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de pesquisas
analyticsRouter.get('/surveys', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getSurveyMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de economia
analyticsRouter.get('/economy', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getEconomyMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas da loja
analyticsRouter.get('/shop', validateDateRange, validateGranularity, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getShopMetrics(
      req.dateRange as DateRange,
      req.granularity as TimeGranularity
    );
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de engajamento
analyticsRouter.get('/engagement', validateDateRange, validateGranularity, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getEngagementMetrics(
      req.dateRange as DateRange,
      req.granularity as TimeGranularity
    );
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para dados demográficos
analyticsRouter.get('/demographics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demographics = await analyticsService.getUserDemographics();
    res.json(demographics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para métricas de transmissões
analyticsRouter.get('/streams', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getStreamMetrics(req.dateRange as DateRange);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Endpoint para exportar dados brutos para relatórios
analyticsRouter.get('/export', validateDateRange, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.query;
    const dateRange = req.dateRange as DateRange;
    
    // Obtém todos os dados para exportação
    const dashboardData = await analyticsService.getDashboardMetrics(dateRange);
    
    // Preparar dados conforme formato solicitado
    if (format === 'csv') {
      // Em uma implementação real, converteria dados para CSV
      // e configuraria headers apropriados
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=qg_furioso_analytics_${Date.now()}.csv`);
      res.send('Dados em formato CSV seriam enviados aqui');
    } else {
      // Formato padrão é JSON
      res.json({
        exportedAt: new Date().toISOString(),
        dateRange,
        data: dashboardData
      });
    }
  } catch (error) {
    next(error);
  }
});

// Export do router
export default analyticsRouter;