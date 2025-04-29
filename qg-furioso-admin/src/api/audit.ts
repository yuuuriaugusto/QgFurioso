import { AuditLog, PaginationParams, SortParams } from '@types';
import { get } from './api';

/**
 * Busca logs de auditoria com filtros e paginação
 */
export async function fetchAuditLogs(
  filters: {
    adminId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'timestamp', order: 'descend' }
): Promise<{ data: AuditLog[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.adminId) queryParams.append('adminId', filters.adminId.toString());
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.entityType) queryParams.append('entityType', filters.entityType);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: AuditLog[]; total: number }>(`/api/admin/audit?${queryParams.toString()}`);
}

/**
 * Busca um log de auditoria específico por ID
 */
export async function fetchAuditLogDetails(logId: number): Promise<AuditLog> {
  return await get<AuditLog>(`/api/admin/audit/${logId}`);
}

/**
 * Busca tipos de ações disponíveis para logs de auditoria
 */
export async function fetchAuditActionTypes(): Promise<string[]> {
  return await get<string[]>('/api/admin/audit/action-types');
}

/**
 * Busca tipos de entidades disponíveis para logs de auditoria
 */
export async function fetchAuditEntityTypes(): Promise<string[]> {
  return await get<string[]>('/api/admin/audit/entity-types');
}

/**
 * Busca estatísticas de auditoria por admin
 * Retorna um objeto com o número de ações por administrador
 */
export async function fetchAuditStatsByAdmin(
  period: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<Array<{ adminId: number; adminName: string; count: number }>> {
  return await get<Array<{ adminId: number; adminName: string; count: number }>>(`/api/admin/audit/stats/by-admin?period=${period}`);
}

/**
 * Busca estatísticas de auditoria por tipo de ação
 * Retorna um objeto com o número de ações por tipo
 */
export async function fetchAuditStatsByAction(
  period: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<Array<{ action: string; count: number }>> {
  return await get<Array<{ action: string; count: number }>>(`/api/admin/audit/stats/by-action?period=${period}`);
}