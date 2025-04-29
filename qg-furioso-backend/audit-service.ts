import { db } from './db';
import { 
  auditLogs, 
  AuditLog, 
  AuditAction, 
  AuditEntityType,
  IAuditService
} from '@shared/audit-schema';
import { and, eq, gte, lte, desc, asc, count } from 'drizzle-orm';

/**
 * Implementação do serviço de auditoria
 */
export class AuditService implements IAuditService {
  /**
   * Registra uma ação no log de auditoria
   */
  async logAction(
    adminId: number,
    adminIdentity: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string | number,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    try {
      // Preparar os dados do log
      const logData = {
        adminId,
        adminIdentity,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        metadata: metadata || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      };

      // Inserir no banco de dados
      const [insertedLog] = await db.insert(auditLogs).values(logData).returning();
      
      return insertedLog;
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
      throw new Error('Falha ao registrar atividade no log de auditoria');
    }
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async getLogs(
    filters?: {
      adminId?: number;
      action?: AuditAction;
      entityType?: AuditEntityType;
      entityId?: string | number;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ): Promise<{
    data: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      // Construir as condições de filtro
      const whereConditions = [];
      
      if (filters?.adminId) {
        whereConditions.push(eq(auditLogs.adminId, filters.adminId));
      }
      
      if (filters?.action) {
        whereConditions.push(eq(auditLogs.action, filters.action));
      }
      
      if (filters?.entityType) {
        whereConditions.push(eq(auditLogs.entityType, filters.entityType));
      }
      
      if (filters?.entityId) {
        whereConditions.push(eq(auditLogs.entityId, String(filters.entityId)));
      }
      
      if (filters?.startDate) {
        whereConditions.push(gte(auditLogs.timestamp, filters.startDate));
      }
      
      if (filters?.endDate) {
        whereConditions.push(lte(auditLogs.timestamp, filters.endDate));
      }
      
      // Aplicar condições WHERE se houver alguma
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Contar total de itens para paginação
      const [countResult] = await db
        .select({ value: count() })
        .from(auditLogs)
        .where(whereClause);
      
      const totalItems = countResult?.value || 0;
      
      // Configurar paginação
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 50;
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Buscar registros com paginação
      const logs = await db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.timestamp))
        .limit(limit)
        .offset(offset);
      
      return {
        data: logs,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      throw new Error('Falha ao buscar logs de auditoria');
    }
  }

  /**
   * Exporta logs de auditoria para formato específico
   */
  async exportLogs(
    format: 'json' | 'csv',
    filters?: {
      adminId?: number;
      action?: AuditAction;
      entityType?: AuditEntityType;
      entityId?: string | number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<string> {
    try {
      // Construir as condições de filtro
      const whereConditions = [];
      
      if (filters?.adminId) {
        whereConditions.push(eq(auditLogs.adminId, filters.adminId));
      }
      
      if (filters?.action) {
        whereConditions.push(eq(auditLogs.action, filters.action));
      }
      
      if (filters?.entityType) {
        whereConditions.push(eq(auditLogs.entityType, filters.entityType));
      }
      
      if (filters?.entityId) {
        whereConditions.push(eq(auditLogs.entityId, String(filters.entityId)));
      }
      
      if (filters?.startDate) {
        whereConditions.push(gte(auditLogs.timestamp, filters.startDate));
      }
      
      if (filters?.endDate) {
        whereConditions.push(lte(auditLogs.timestamp, filters.endDate));
      }
      
      // Aplicar condições WHERE se houver alguma
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      // Buscar todos os logs que correspondem aos filtros
      const logs = await db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.timestamp));
      
      // Processar de acordo com o formato solicitado
      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else if (format === 'csv') {
        // Cabeçalho CSV
        const headers = [
          'ID',
          'Admin ID',
          'Admin Identity',
          'Action',
          'Entity Type',
          'Entity ID',
          'Metadata',
          'IP Address',
          'User Agent',
          'Timestamp'
        ].join(',');
        
        // Linhas de dados
        const rows = logs.map(log => [
          log.id,
          log.adminId,
          `"${log.adminIdentity.replace(/"/g, '""')}"`, // Escape aspas em CSV
          log.action,
          log.entityType,
          log.entityId || '',
          `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`,
          log.ipAddress || '',
          `"${(log.userAgent || '').replace(/"/g, '""')}"`,
          new Date(log.timestamp).toISOString()
        ].join(','));
        
        return [headers, ...rows].join('\n');
      }
      
      throw new Error(`Formato de exportação não suportado: ${format}`);
    } catch (error) {
      console.error('Erro ao exportar logs de auditoria:', error);
      throw new Error('Falha ao exportar logs de auditoria');
    }
  }
}

// Instância para uso no restante da aplicação
export const auditService = new AuditService();