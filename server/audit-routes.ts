import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { auditLogs } from "../shared/schema";
import { eq, desc, and, between, asc, gte, lte, count } from "drizzle-orm";
import { adminUsers } from "../shared/schema";

export const auditRouter = Router();

// Tipos para auditoria
export type AuditAction = "create" | "update" | "delete" | "view" | "login" | "logout" | "process";
export type AuditEntityType = 
  "user" | "admin_user" | "news" | "shop_item" | "redemption" | 
  "survey" | "support_ticket" | "match" | "stream" | "fan_sentiment";

// Middleware para verificar se o usuário é administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Acesso não autorizado" });
  }
  next();
};

// Função para registrar ações de auditoria
export const logAuditAction = async (
  req: Request,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId?: number | string,
  details?: any
) => {
  try {
    // Se o usuário não estiver autenticado como admin, não registra
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return;
    }

    // Registrar a ação no log de auditoria
    await db.insert(auditLogs).values({
      adminId: req.user.id,
      action,
      entityType,
      entityId: entityId ? Number(entityId) : null,
      details,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Erro ao registrar ação de auditoria:", error);
    // Não fazemos throw aqui para não afetar o fluxo principal
  }
};

// Obter logs de auditoria com filtros
auditRouter.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    interface QueryParams {
      action?: AuditAction;
      entityType?: AuditEntityType;
      adminId?: number;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }

    const {
      action,
      entityType,
      adminId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query as unknown as QueryParams;

    // Construir a query com base nos filtros
    let query = db.select().from(auditLogs);

    if (action) {
      query = query.where(eq(auditLogs.action, action));
    }

    if (entityType) {
      query = query.where(eq(auditLogs.entityType, entityType));
    }

    if (adminId) {
      query = query.where(eq(auditLogs.adminId, adminId));
    }

    if (startDate && endDate) {
      query = query.where(
        between(auditLogs.createdAt, new Date(startDate), new Date(endDate))
      );
    } else if (startDate) {
      query = query.where(gte(auditLogs.createdAt, new Date(startDate)));
    } else if (endDate) {
      query = query.where(lte(auditLogs.createdAt, new Date(endDate)));
    }

    // Adicionar paginação
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset).orderBy(desc(auditLogs.createdAt));

    // Executar a query
    const logs = await query;

    // Obter contagem total para metadados de paginação
    const countQuery = db.select({ count: count() }).from(auditLogs);
    if (action) {
      countQuery.where(eq(auditLogs.action, action));
    }
    if (entityType) {
      countQuery.where(eq(auditLogs.entityType, entityType));
    }
    if (adminId) {
      countQuery.where(eq(auditLogs.adminId, adminId));
    }
    if (startDate && endDate) {
      countQuery.where(
        between(auditLogs.createdAt, new Date(startDate), new Date(endDate))
      );
    } else if (startDate) {
      countQuery.where(gte(auditLogs.createdAt, new Date(startDate)));
    } else if (endDate) {
      countQuery.where(lte(auditLogs.createdAt, new Date(endDate)));
    }

    const totalCount = await countQuery;

    // Enriquecer os logs com informações dos admins
    const logsWithAdminInfo = await Promise.all(
      logs.map(async (log) => {
        if (log.adminId) {
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.id, log.adminId),
            columns: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });
          return { ...log, admin };
        }
        return log;
      })
    );

    // Registrar esta consulta em auditoria
    await logAuditAction(req, "view", "audit_logs");

    return res.json({
      logs: logsWithAdminInfo,
      pagination: {
        total: Number(totalCount[0]?.count || 0),
        page,
        limit,
        pages: Math.ceil(Number(totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Exportar logs de auditoria (formato CSV)
auditRouter.get('/export', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    interface QueryParams {
      action?: AuditAction;
      entityType?: AuditEntityType;
      adminId?: number;
      startDate?: Date;
      endDate?: Date;
      format?: 'csv' | 'json';
    }

    const {
      action,
      entityType,
      adminId,
      startDate,
      endDate,
      format = 'csv',
    } = req.query as unknown as QueryParams;

    // Construir a query com base nos filtros
    let query = db.select().from(auditLogs);

    if (action) {
      query = query.where(eq(auditLogs.action, action));
    }

    if (entityType) {
      query = query.where(eq(auditLogs.entityType, entityType));
    }

    if (adminId) {
      query = query.where(eq(auditLogs.adminId, adminId));
    }

    if (startDate && endDate) {
      query = query.where(
        between(auditLogs.createdAt, new Date(startDate), new Date(endDate))
      );
    } else if (startDate) {
      query = query.where(gte(auditLogs.createdAt, new Date(startDate)));
    } else if (endDate) {
      query = query.where(lte(auditLogs.createdAt, new Date(endDate)));
    }

    // Ordenar pelos mais recentes primeiro
    query = query.orderBy(desc(auditLogs.createdAt));

    // Executar a query
    const logs = await query;

    // Enriquecer os logs com informações dos admins
    const logsWithAdminInfo = await Promise.all(
      logs.map(async (log) => {
        if (log.adminId) {
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.id, log.adminId),
            columns: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });
          
          return { 
            ...log, 
            adminUsername: admin?.username || 'Desconhecido',
            adminName: admin ? `${admin.firstName} ${admin.lastName}` : 'Desconhecido',
            detailsJson: JSON.stringify(log.details || {}),
          };
        }
        return { 
          ...log, 
          adminUsername: 'Desconhecido',
          adminName: 'Desconhecido',
          detailsJson: JSON.stringify(log.details || {}),
        };
      })
    );

    // Registrar esta exportação em auditoria
    await logAuditAction(req, "view", "audit_logs", undefined, { action: "export", format });

    // Formatar e retornar de acordo com o formato solicitado
    if (format === 'json') {
      return res.json(logsWithAdminInfo);
    } else {
      // Formato CSV
      const csvHeader = "ID,Admin ID,Admin,Ação,Tipo de Entidade,ID da Entidade,Detalhes,Endereço IP,User Agent,Data\n";
      
      const csvRows = logsWithAdminInfo.map(log => {
        return `${log.id},${log.adminId || ''},${log.adminName},${log.action},${log.entityType},${log.entityId || ''},"${log.detailsJson.replace(/"/g, '""')}",${log.ipAddress || ''},"${(log.userAgent || '').replace(/"/g, '""')}","${new Date(log.createdAt).toISOString()}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      
      return res.send(csvContent);
    }
  } catch (error) {
    next(error);
  }
});

// Listar os tipos de ações disponíveis
auditRouter.get('/actions', requireAdmin, (req: Request, res: Response) => {
  const actions: AuditAction[] = ["create", "update", "delete", "view", "login", "logout", "process"];
  const entityTypes: AuditEntityType[] = [
    "user", "admin_user", "news", "shop_item", "redemption", 
    "survey", "support_ticket", "match", "stream", "fan_sentiment"
  ];
  
  return res.json({ actions, entityTypes });
});