import { db } from './db';
import { sql } from 'drizzle-orm';
import { 
  users, userProfiles, coinBalances, coinTransactions, 
  shopItems, redemptionOrders, newsContent, surveys, 
  surveyResponses, matches, streams 
} from '@shared/schema';
import { eq, and, gte, lte, count, sum, avg, max, isNotNull, desc, asc } from 'drizzle-orm';
import { PgColumnData } from 'drizzle-orm/pg-core';

/**
 * Tipos para relatórios de análise
 */
export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type TimeGranularity = 'day' | 'week' | 'month';

export type UserActivityMetrics = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  avgSessionDuration: number;
};

export type ContentMetrics = {
  totalViews: number;
  uniqueViews: number;
  avgEngagementRate: number;
  popularCategories: Array<{ category: string; views: number }>;
};

export type SurveyMetrics = {
  totalSurveys: number;
  totalResponses: number;
  avgCompletionRate: number;
  avgResponseTime: number;
  surveyDistribution: Array<{ surveyId: number; title: string; responses: number }>;
};

export type EconomyMetrics = {
  totalCoinsIssued: number;
  totalCoinsSpent: number;
  activeCoinBalance: number;
  avgUserBalance: number;
  topEarners: Array<{ userId: number; username: string; earned: number }>;
  topSpenders: Array<{ userId: number; username: string; spent: number }>;
};

export type ShopMetrics = {
  totalOrders: number;
  totalRevenue: number;
  popularItems: Array<{ itemId: number; name: string; orders: number }>;
  orderTrend: Array<{ date: string; orders: number; revenue: number }>;
};

export type EngagementMetrics = {
  totalInteractions: number;
  interactionsByType: Record<string, number>;
  engagementTrend: Array<{ date: string; interactions: number }>;
  topEngagers: Array<{ userId: number; username: string; interactions: number }>;
};

export type UserDemographics = {
  ageDistribution: Array<{ range: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  locationDistribution: Array<{ location: string; count: number; percentage: number }>;
};

export type StreamMetrics = {
  totalStreams: number;
  totalViewers: number;
  avgViewerCount: number;
  peakViewers: number;
  streamDuration: number;
  viewerRetention: number;
};

/**
 * Função auxiliar para formatar data para agrupamento
 */
function getDateTruncFormat(granularity: TimeGranularity): string {
  switch (granularity) {
    case 'day':
      return 'day';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    default:
      return 'day';
  }
}

/**
 * Classe principal para análise e relatórios
 */
export class AnalyticsService {
  /**
   * Obtém métricas de atividade de usuário
   */
  async getUserActivityMetrics(dateRange: DateRange): Promise<UserActivityMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Total de usuários registrados
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);
    
    // Usuários ativos no período (que fizeram login)
    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          isNotNull(users.lastLoginAt),
          gte(users.lastLoginAt, startDate),
          lte(users.lastLoginAt, endDate)
        )
      );
    
    // Novos usuários no período
    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, startDate),
          lte(users.createdAt, endDate)
        )
      );
    
    // Tempo médio de sessão (simulado - necessitaria de uma tabela de sessões)
    // No mundo real, isso viria de analytics como Google Analytics ou uma tabela de sessões
    const avgSessionDuration = 480; // 8 minutos, em segundos
    
    // Taxa de retenção (usuários ativos / total de usuários)
    const retentionRate = totalUsersResult.count > 0 
      ? (activeUsersResult.count / totalUsersResult.count) * 100 
      : 0;
    
    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      newUsers: newUsersResult.count,
      retentionRate: Number(retentionRate.toFixed(2)),
      avgSessionDuration,
    };
  }

  /**
   * Obtém métricas de conteúdo
   */
  async getContentMetrics(dateRange: DateRange): Promise<ContentMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Nota: Em um sistema real, você teria tabelas de visualizações de conteúdo
    // Aqui estamos simulando com base em dados disponíveis
    
    // Total de visualizações (simulado)
    const totalViews = 25000;
    
    // Visualizações únicas (simulado)
    const uniqueViews = 18000;
    
    // Taxa média de engajamento (simulado)
    const avgEngagementRate = 35.6;
    
    // Categorias populares
    const popularCategories = await db
      .select({
        category: newsContent.category,
        views: sql<number>`count(*)`.as('views')
      })
      .from(newsContent)
      .where(
        and(
          gte(newsContent.createdAt, startDate),
          lte(newsContent.createdAt, endDate)
        )
      )
      .groupBy(newsContent.category)
      .orderBy(desc(sql`views`))
      .limit(5);
    
    return {
      totalViews,
      uniqueViews,
      avgEngagementRate,
      popularCategories,
    };
  }

  /**
   * Obtém métricas de pesquisas
   */
  async getSurveyMetrics(dateRange: DateRange): Promise<SurveyMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Total de pesquisas no período
    const [totalSurveysResult] = await db
      .select({ count: count() })
      .from(surveys)
      .where(
        and(
          gte(surveys.createdAt, startDate),
          lte(surveys.createdAt, endDate)
        )
      );
    
    // Total de respostas no período
    const [totalResponsesResult] = await db
      .select({ count: count() })
      .from(surveyResponses)
      .where(
        and(
          gte(surveyResponses.completedAt, startDate),
          lte(surveyResponses.completedAt, endDate)
        )
      );
    
    // Distribuição de pesquisas por respostas
    const surveyDistribution = await db
      .select({
        surveyId: surveyResponses.surveyId,
        title: surveys.title,
        responses: count().as('responses')
      })
      .from(surveyResponses)
      .innerJoin(surveys, eq(surveys.id, surveyResponses.surveyId))
      .where(
        and(
          gte(surveyResponses.completedAt, startDate),
          lte(surveyResponses.completedAt, endDate)
        )
      )
      .groupBy(surveyResponses.surveyId, surveys.title)
      .orderBy(desc(sql`responses`))
      .limit(10);
    
    // Taxa média de conclusão (simulado)
    const avgCompletionRate = 78.5;
    
    // Tempo médio de resposta (simulado, em segundos)
    const avgResponseTime = 240;
    
    return {
      totalSurveys: totalSurveysResult.count,
      totalResponses: totalResponsesResult.count,
      avgCompletionRate,
      avgResponseTime,
      surveyDistribution,
    };
  }

  /**
   * Obtém métricas da economia de moedas
   */
  async getEconomyMetrics(dateRange: DateRange): Promise<EconomyMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Total de moedas emitidas no período
    const [issuedCoinsResult] = await db
      .select({
        total: sum(coinTransactions.amount).as('total')
      })
      .from(coinTransactions)
      .where(
        and(
          gte(coinTransactions.createdAt, startDate),
          lte(coinTransactions.createdAt, endDate),
          eq(coinTransactions.transactionType, 'credit')
        )
      );
    
    // Total de moedas gastas no período
    const [spentCoinsResult] = await db
      .select({
        total: sum(coinTransactions.amount).as('total')
      })
      .from(coinTransactions)
      .where(
        and(
          gte(coinTransactions.createdAt, startDate),
          lte(coinTransactions.createdAt, endDate),
          eq(coinTransactions.transactionType, 'debit')
        )
      );
    
    // Saldo ativo de todas as moedas em circulação
    const [activeCoinBalanceResult] = await db
      .select({
        total: sum(coinBalances.balance).as('total')
      })
      .from(coinBalances);
    
    // Saldo médio por usuário
    const [avgUserBalanceResult] = await db
      .select({
        avg: avg(coinBalances.balance).as('avg')
      })
      .from(coinBalances)
      .where(
        gt(coinBalances.balance, 0)
      );
    
    // Top ganhadores de moedas no período
    const topEarners = await db
      .select({
        userId: coinTransactions.userId,
        username: users.primaryIdentity,
        earned: sum(coinTransactions.amount).as('earned')
      })
      .from(coinTransactions)
      .innerJoin(users, eq(users.id, coinTransactions.userId))
      .where(
        and(
          gte(coinTransactions.createdAt, startDate),
          lte(coinTransactions.createdAt, endDate),
          eq(coinTransactions.transactionType, 'credit')
        )
      )
      .groupBy(coinTransactions.userId, users.primaryIdentity)
      .orderBy(desc(sql`earned`))
      .limit(10);
    
    // Top gastadores de moedas no período
    const topSpenders = await db
      .select({
        userId: coinTransactions.userId,
        username: users.primaryIdentity,
        spent: sum(coinTransactions.amount).as('spent')
      })
      .from(coinTransactions)
      .innerJoin(users, eq(users.id, coinTransactions.userId))
      .where(
        and(
          gte(coinTransactions.createdAt, startDate),
          lte(coinTransactions.createdAt, endDate),
          eq(coinTransactions.transactionType, 'debit')
        )
      )
      .groupBy(coinTransactions.userId, users.primaryIdentity)
      .orderBy(desc(sql`spent`))
      .limit(10);
    
    return {
      totalCoinsIssued: issuedCoinsResult.total || 0,
      totalCoinsSpent: spentCoinsResult.total || 0,
      activeCoinBalance: activeCoinBalanceResult.total || 0,
      avgUserBalance: Number((avgUserBalanceResult.avg || 0).toFixed(2)),
      topEarners,
      topSpenders,
    };
  }

  /**
   * Obtém métricas da loja
   */
  async getShopMetrics(dateRange: DateRange, granularity: TimeGranularity = 'day'): Promise<ShopMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Total de pedidos no período
    const [totalOrdersResult] = await db
      .select({
        count: count().as('count')
      })
      .from(redemptionOrders)
      .where(
        and(
          gte(redemptionOrders.createdAt, startDate),
          lte(redemptionOrders.createdAt, endDate)
        )
      );
    
    // Total de receita (em moedas) no período
    const [totalRevenueResult] = await db
      .select({
        total: sum(redemptionOrders.coinCost).as('total')
      })
      .from(redemptionOrders)
      .where(
        and(
          gte(redemptionOrders.createdAt, startDate),
          lte(redemptionOrders.createdAt, endDate)
        )
      );
    
    // Itens mais populares por pedidos
    const popularItems = await db
      .select({
        itemId: redemptionOrders.itemId,
        name: shopItems.name,
        orders: count().as('orders')
      })
      .from(redemptionOrders)
      .innerJoin(shopItems, eq(shopItems.id, redemptionOrders.itemId))
      .where(
        and(
          gte(redemptionOrders.createdAt, startDate),
          lte(redemptionOrders.createdAt, endDate)
        )
      )
      .groupBy(redemptionOrders.itemId, shopItems.name)
      .orderBy(desc(sql`orders`))
      .limit(10);
    
    // Tendência de pedidos ao longo do tempo
    const truncateSql = sql`date_trunc(${getDateTruncFormat(granularity)}, ${redemptionOrders.createdAt})`;
    
    const orderTrend = await db
      .select({
        date: truncateSql.as('date'),
        orders: count().as('orders'),
        revenue: sum(redemptionOrders.coinCost).as('revenue')
      })
      .from(redemptionOrders)
      .where(
        and(
          gte(redemptionOrders.createdAt, startDate),
          lte(redemptionOrders.createdAt, endDate)
        )
      )
      .groupBy(truncateSql)
      .orderBy(asc(sql`date`));
    
    // Formatar datas para resposta
    const formattedOrderTrend = orderTrend.map(item => ({
      date: item.date.toISOString().split('T')[0],
      orders: item.orders,
      revenue: item.revenue || 0,
    }));
    
    return {
      totalOrders: totalOrdersResult.count,
      totalRevenue: totalRevenueResult.total || 0,
      popularItems,
      orderTrend: formattedOrderTrend,
    };
  }

  /**
   * Obtém métricas de engajamento
   */
  async getEngagementMetrics(dateRange: DateRange, granularity: TimeGranularity = 'day'): Promise<EngagementMetrics> {
    // Nota: Em um sistema real, você teria tabelas específicas de interações/engajamento
    // Aqui estamos simulando com base em dados disponíveis
    
    // Total de interações (simulado)
    const totalInteractions = 125000;
    
    // Interações por tipo (simulado)
    const interactionsByType = {
      'page_view': 85000,
      'content_read': 25000,
      'survey_response': 8000,
      'product_view': 5000,
      'order_placed': 2000,
    };
    
    // Tendência de engajamento ao longo do tempo (simulado)
    const engagementTrend = [
      { date: '2025-01-01', interactions: 4200 },
      { date: '2025-01-02', interactions: 4500 },
      { date: '2025-01-03', interactions: 3800 },
      { date: '2025-01-04', interactions: 5100 },
      { date: '2025-01-05', interactions: 6200 },
      { date: '2025-01-06', interactions: 5800 },
      { date: '2025-01-07', interactions: 4900 },
    ];
    
    // Top engajadores (simulado)
    const topEngagers = [
      { userId: 101, username: 'fulanodematos', interactions: 382 },
      { userId: 243, username: 'mariaalves', interactions: 276 },
      { userId: 56, username: 'joaopedro', interactions: 251 },
      { userId: 189, username: 'carlossilva', interactions: 234 },
      { userId: 77, username: 'clarasantos', interactions: 215 },
    ];
    
    return {
      totalInteractions,
      interactionsByType,
      engagementTrend,
      topEngagers,
    };
  }

  /**
   * Obtém dados demográficos dos usuários
   */
  async getUserDemographics(): Promise<UserDemographics> {
    // Total de usuários
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult.count;
    
    // Distribuição por idade (baseado na data de nascimento)
    // Nota: Requer que o userProfile tenha um campo birthdate
    const ageRanges = [
      { min: 0, max: 17, label: 'Menor de 18' },
      { min: 18, max: 24, label: '18-24' },
      { min: 25, max: 34, label: '25-34' },
      { min: 35, max: 44, label: '35-44' },
      { min: 45, max: 54, label: '45-54' },
      { min: 55, max: 999, label: '55+' },
    ];
    
    const ageDistribution = await Promise.all(
      ageRanges.map(async (range) => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - range.min, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - range.max - 1, today.getMonth(), today.getDate() + 1);
        
        const [result] = await db
          .select({ count: count() })
          .from(userProfiles)
          .where(
            and(
              isNotNull(userProfiles.birthdate),
              lte(userProfiles.birthdate, maxDate),
              gt(userProfiles.birthdate, minDate)
            )
          );
        
        const count = result.count;
        const percentage = totalUsers > 0 ? Number(((count / totalUsers) * 100).toFixed(1)) : 0;
        
        return {
          range: range.label,
          count,
          percentage,
        };
      })
    );
    
    // Distribuição por gênero
    // Nota: Requer que o userProfile tenha um campo gender
    const genderDistribution = [
      { gender: 'Masculino', count: 6500, percentage: 65.0 },
      { gender: 'Feminino', count: 3200, percentage: 32.0 },
      { gender: 'Outro', count: 300, percentage: 3.0 },
    ];
    
    // Distribuição por localização
    // Nota: Requer que o userProfile tenha um campo location
    const locationData = await db
      .select({
        location: userProfiles.location,
        count: count().as('count')
      })
      .from(userProfiles)
      .where(isNotNull(userProfiles.location))
      .groupBy(userProfiles.location)
      .orderBy(desc(sql`count`))
      .limit(10);
    
    const locationDistribution = locationData.map(item => ({
      location: item.location || 'Desconhecido',
      count: item.count,
      percentage: totalUsers > 0 ? Number(((item.count / totalUsers) * 100).toFixed(1)) : 0,
    }));
    
    return {
      ageDistribution,
      genderDistribution,
      locationDistribution,
    };
  }

  /**
   * Obtém métricas de transmissões ao vivo
   */
  async getStreamMetrics(dateRange: DateRange): Promise<StreamMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Total de transmissões no período
    const [totalStreamsResult] = await db
      .select({ count: count() })
      .from(streams)
      .where(
        and(
          gte(streams.startTime, startDate),
          lte(streams.startTime, endDate)
        )
      );
    
    // Nota: Em um sistema real, você teria tabelas de visualizações de stream
    // Aqui estamos simulando esses dados
    
    // Total de espectadores (simulado)
    const totalViewers = 75000;
    
    // Média de espectadores por stream (simulado)
    const avgViewerCount = 1250;
    
    // Pico de espectadores (simulado)
    const peakViewers = 3500;
    
    // Duração média das streams em minutos (simulado)
    const streamDuration = 120;
    
    // Taxa de retenção de espectadores (simulado)
    const viewerRetention = 67.5;
    
    return {
      totalStreams: totalStreamsResult.count,
      totalViewers,
      avgViewerCount,
      peakViewers,
      streamDuration,
      viewerRetention,
    };
  }

  /**
   * Obtém um dashboard completo com todas as métricas
   */
  async getDashboardMetrics(dateRange: DateRange): Promise<{
    userActivity: UserActivityMetrics;
    content: ContentMetrics;
    survey: SurveyMetrics;
    economy: EconomyMetrics;
    shop: ShopMetrics;
    engagement: EngagementMetrics;
    demographics: UserDemographics;
    streams: StreamMetrics;
  }> {
    // Executa todas as consultas em paralelo para melhor performance
    const [
      userActivity,
      content,
      survey,
      economy,
      shop,
      engagement,
      demographics,
      streams
    ] = await Promise.all([
      this.getUserActivityMetrics(dateRange),
      this.getContentMetrics(dateRange),
      this.getSurveyMetrics(dateRange),
      this.getEconomyMetrics(dateRange),
      this.getShopMetrics(dateRange),
      this.getEngagementMetrics(dateRange),
      this.getUserDemographics(),
      this.getStreamMetrics(dateRange)
    ]);
    
    return {
      userActivity,
      content,
      survey,
      economy,
      shop,
      engagement,
      demographics,
      streams
    };
  }
}

// Exporta instância para uso em rotas
export const analyticsService = new AnalyticsService();