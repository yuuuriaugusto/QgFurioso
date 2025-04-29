import { DashboardMetrics } from '@types';
import { get } from './api';

/**
 * Busca métricas gerais para o dashboard
 * @param period Período das métricas (default: 30d)
 * @returns Dados de métricas para o dashboard
 */
export async function fetchDashboardMetrics(period: '24h' | '7d' | '30d' | 'all' = '30d'): Promise<DashboardMetrics> {
  return await get<DashboardMetrics>(`/api/admin/dashboard/metrics?period=${period}`);
}

/**
 * Busca dados para gráficos do dashboard
 * @param chartType Tipo de gráfico
 * @param period Período do gráfico
 * @returns Dados para o gráfico específico
 */
export async function fetchDashboardChart(
  chartType: 'registrations' | 'coins' | 'activity' | 'redemptions',
  period: '7d' | '30d' | '90d' | '12m' = '30d'
): Promise<any> {
  return await get<any>(`/api/admin/dashboard/charts/${chartType}?period=${period}`);
}