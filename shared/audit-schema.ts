/**
 * QG FURIOSO - Schema de Auditoria
 * 
 * Este arquivo define o schema específico para auditoria e monitoramento das ações realizadas
 * na plataforma administrativa, responsável por registrar todas as operações importantes.
 * 
 * @version 2.5.0
 * @author Equipe QG FURIOSO
 * @copyright FURIA Esports 2025
 */

import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tabela de logs de auditoria para rastrear ações administrativas
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  adminIdentity: text("admin_identity").notNull(),
  action: text("action").notNull(), // create, update, delete, login, etc.
  entityType: text("entity_type").notNull(), // Tipo de entidade afetada: user, content, shopItem, etc.
  entityId: text("entity_id"), // ID da entidade afetada (pode ser variável em formato)
  metadata: jsonb("metadata"), // Detalhes específicos da ação, dados antes/depois, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Schema para inserção
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Tipos
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Constantes para tipos de ações
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  ASSIGN: 'assign',
} as const;

// Constantes para tipos de entidades
export const AUDIT_ENTITY_TYPES = {
  USER: 'user',
  USER_PROFILE: 'user_profile',
  SHOP_ITEM: 'shop_item',
  REDEMPTION_ORDER: 'redemption_order',
  NEWS_CONTENT: 'news_content',
  SURVEY: 'survey',
  KYC_VERIFICATION: 'kyc_verification',
  STREAM: 'stream',
  MATCH: 'match',
  COIN_TRANSACTION: 'coin_transaction',
  SYSTEM_SETTING: 'system_setting',
} as const;

// Tipos para ações e entidades
export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[keyof typeof AUDIT_ENTITY_TYPES];

/**
 * Interface para um serviço de auditoria
 */
export interface IAuditService {
  /**
   * Registra uma ação administrativa no log de auditoria
   * @param adminId ID do administrador que executou a ação
   * @param adminIdentity Identidade do administrador (email, nome)
   * @param action Tipo de ação executada
   * @param entityType Tipo de entidade afetada
   * @param entityId ID da entidade afetada (opcional)
   * @param metadata Metadados adicionais sobre a ação (opcional)
   * @param ipAddress Endereço IP do administrador (opcional)
   * @param userAgent User-Agent do navegador do administrador (opcional)
   */
  logAction(
    adminId: number,
    adminIdentity: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string | number,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog>;

  /**
   * Busca logs de auditoria com filtros
   * @param filters Filtros para a busca
   * @param pagination Opções de paginação
   */
  getLogs(
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
  }>;
}