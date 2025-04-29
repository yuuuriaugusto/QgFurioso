import { Router, Request, Response, NextFunction } from 'express';
import { auditService } from './audit-service';
import { AuditAction, AuditEntityType } from '@shared/audit-schema';
import { z } from 'zod';

// Router para APIs de auditoria
export const auditRouter = Router();

// Middleware para verificar permissões de admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  // Verificar se o usuário é administrador
  // Em um sistema real, você verificaria um campo role ou permissões
  if (req.user.id !== 1) {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar logs de auditoria." });
  }
  
  next();
};

// Middleware para registrar ação de auditoria
export const logAuditAction = async (
  req: Request,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId?: string | number,
  metadata?: Record<string, any>
) => {
  if (!req.user) {
    return;
  }
  
  try {
    await auditService.logAction(
      req.user.id,
      req.user.primaryIdentity,
      action,
      entityType,
      entityId,
      metadata,
      req.ip,
      req.get('user-agent')
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não interrompe o fluxo da aplicação caso o log de auditoria falhe
  }
};

// Endpoint para obter logs de auditoria
auditRouter.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar parâmetros de consulta
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    // Preparar filtros
    const filters: {
      adminId?: number;
      action?: AuditAction;
      entityType?: AuditEntityType;
      entityId?: string | number;
      startDate?: Date;
      endDate?: Date;
    } = {};
    
    if (req.query.adminId) {
      filters.adminId = parseInt(req.query.adminId as string);
    }
    
    if (req.query.action) {
      filters.action = req.query.action as AuditAction;
    }
    
    if (req.query.entityType) {
      filters.entityType = req.query.entityType as AuditEntityType;
    }
    
    if (req.query.entityId) {
      filters.entityId = req.query.entityId as string;
    }
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    // Buscar logs
    const logs = await auditService.getLogs(
      filters,
      { page, limit }
    );
    
    // Registrar esta ação de visualização de logs
    await logAuditAction(
      req,
      'export' as AuditAction,
      'system_setting' as AuditEntityType,
      undefined,
      { action: 'view_audit_logs', filters }
    );
    
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Endpoint para exportar logs de auditoria
auditRouter.get('/export', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar formato
    const format = (req.query.format as string)?.toLowerCase();
    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ message: "Formato inválido. Use 'json' ou 'csv'." });
    }
    
    // Preparar filtros
    const filters: {
      adminId?: number;
      action?: AuditAction;
      entityType?: AuditEntityType;
      entityId?: string | number;
      startDate?: Date;
      endDate?: Date;
    } = {};
    
    if (req.query.adminId) {
      filters.adminId = parseInt(req.query.adminId as string);
    }
    
    if (req.query.action) {
      filters.action = req.query.action as AuditAction;
    }
    
    if (req.query.entityType) {
      filters.entityType = req.query.entityType as AuditEntityType;
    }
    
    if (req.query.entityId) {
      filters.entityId = req.query.entityId as string;
    }
    
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    
    // Exportar logs
    const exportedData = await auditService.exportLogs(
      format as 'json' | 'csv',
      filters
    );
    
    // Configurar cabeçalhos de resposta
    const filename = `audit_logs_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    }
    
    // Registrar esta ação de exportação
    await logAuditAction(
      req,
      'export' as AuditAction,
      'system_setting' as AuditEntityType,
      undefined,
      { action: 'export_audit_logs', format, filters }
    );
    
    res.send(exportedData);
  } catch (error) {
    next(error);
  }
});

// Endpoint para obter ações disponíveis no sistema de auditoria
auditRouter.get('/actions', requireAdmin, (req: Request, res: Response) => {
  // Importar constantes dos tipos de ação
  const { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } = require('@shared/audit-schema');
  
  res.json({
    actions: AUDIT_ACTIONS,
    entityTypes: AUDIT_ENTITY_TYPES
  });
});

// Export do router
export default auditRouter;