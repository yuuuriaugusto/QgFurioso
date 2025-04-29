import { ApiError, handleApiError } from './api';

// Tipos para relatórios de análise
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

export type DashboardMetrics = {
  userActivity: UserActivityMetrics;
  content: ContentMetrics;
  survey: SurveyMetrics;
  economy: EconomyMetrics;
  shop: ShopMetrics;
  engagement: EngagementMetrics;
  demographics: UserDemographics;
  streams: StreamMetrics;
};

const BASE_URL = '/api/admin/analytics';

/**
 * Serviço de API para análise e relatórios
 */
export const analyticsService = {
  /**
   * Obtém o dashboard completo com todas as métricas
   */
  async getDashboard(dateRange: DateRange): Promise<DashboardMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/dashboard?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas do dashboard', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas de atividade de usuário
   */
  async getUserActivity(dateRange: DateRange): Promise<UserActivityMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/user-activity?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de atividade de usuário', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas de conteúdo
   */
  async getContentMetrics(dateRange: DateRange): Promise<ContentMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/content?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de conteúdo', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas de pesquisas
   */
  async getSurveyMetrics(dateRange: DateRange): Promise<SurveyMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/surveys?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de pesquisas', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas da economia de moedas
   */
  async getEconomyMetrics(dateRange: DateRange): Promise<EconomyMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/economy?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de economia', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas da loja
   */
  async getShopMetrics(dateRange: DateRange, granularity: TimeGranularity = 'day'): Promise<ShopMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/shop?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas da loja', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas de engajamento
   */
  async getEngagementMetrics(dateRange: DateRange, granularity: TimeGranularity = 'day'): Promise<EngagementMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/engagement?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de engajamento', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém dados demográficos dos usuários
   */
  async getUserDemographics(): Promise<UserDemographics> {
    try {
      const response = await fetch(
        `${BASE_URL}/demographics`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar dados demográficos', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtém métricas de transmissões ao vivo
   */
  async getStreamMetrics(dateRange: DateRange): Promise<StreamMetrics> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/streams?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao carregar métricas de transmissões', response.status);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Exporta dados do relatório
   */
  async exportData(dateRange: DateRange, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const startDate = dateRange.startDate.toISOString();
      const endDate = dateRange.endDate.toISOString();
      
      const response = await fetch(
        `${BASE_URL}/export?startDate=${startDate}&endDate=${endDate}&format=${format}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError('Falha ao exportar dados', response.status);
      }

      return await response.blob();
    } catch (error) {
      return handleApiError(error);
    }
  }
};