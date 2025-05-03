import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { supportTickets, supportMessages } from "../shared/schema";
import { eq, desc, and, or, isNull, gte, sql } from "drizzle-orm";
import { users, adminUsers } from "../shared/schema";
import { logAuditAction } from "./audit-routes";

export const adminSupportRouter = Router();

// Middleware para verificar se o usuário é administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Acesso não autorizado" });
  }
  next();
};

// Obter todos os tickets de suporte com seus metadados
adminSupportRouter.get("/tickets", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, priority, category } = req.query;
    
    // Construir a query dinamicamente com base nos filtros
    let query = db.select().from(supportTickets);
    
    if (status) {
      query = query.where(eq(supportTickets.status, status as string));
    }
    
    if (priority) {
      query = query.where(eq(supportTickets.priority, priority as string));
    }
    
    if (category) {
      query = query.where(eq(supportTickets.category, category as string));
    }
    
    // Ordenar pelos mais recentes primeiro
    const tickets = await query.orderBy(desc(supportTickets.createdAt));
    
    // Para cada ticket, vamos obter o número de mensagens e a última mensagem
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const messages = await db.select().from(supportMessages)
          .where(eq(supportMessages.ticketId, ticket.id))
          .orderBy(desc(supportMessages.createdAt));
        
        // Verificar se há mensagens não lidas do usuário
        const unreadMessagesCount = await db.select().from(supportMessages)
          .where(and(
            eq(supportMessages.ticketId, ticket.id),
            eq(supportMessages.senderType, "user"),
            eq(supportMessages.isRead, false)
          ))
          .count();
        
        return {
          ...ticket,
          lastMessage: messages[0] || null,
          messageCount: messages.length,
          unreadCount: Number(unreadMessagesCount[0].count),
        };
      })
    );
    
    return res.json(ticketsWithDetails);
  } catch (error) {
    console.error("Erro ao obter tickets de suporte:", error);
    return res.status(500).json({ message: "Erro ao obter tickets de suporte" });
  }
});

// Obter um ticket específico com todas as suas mensagens
adminSupportRouter.get("/tickets/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, parseInt(id)),
    });
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado" });
    }
    
    // Obter todas as mensagens do ticket
    const messages = await db.select().from(supportMessages)
      .where(eq(supportMessages.ticketId, parseInt(id)))
      .orderBy(desc(supportMessages.createdAt));
    
    // Obter dados do usuário que criou o ticket
    const user = await db.query.users.findFirst({
      where: eq(users.id, ticket.userId),
      columns: {
        id: true,
        primaryIdentity: true,
        status: true,
      },
      with: {
        profile: true,
      },
    });
    
    // Marcar mensagens não lidas do usuário como lidas
    await db.update(supportMessages)
      .set({ isRead: true })
      .where(and(
        eq(supportMessages.ticketId, parseInt(id)),
        eq(supportMessages.senderType, "user"),
        eq(supportMessages.isRead, false)
      ));
    
    return res.json({
      ticket,
      messages,
      user,
    });
  } catch (error) {
    console.error("Erro ao obter detalhes do ticket:", error);
    return res.status(500).json({ message: "Erro ao obter detalhes do ticket" });
  }
});

// Adicionar uma mensagem a um ticket
adminSupportRouter.post("/tickets/:id/messages", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, attachmentUrl } = req.body;
    
    // Validações básicas
    if (!message) {
      return res.status(400).json({ message: "Mensagem é obrigatória" });
    }
    
    // Verificar se o ticket existe
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, parseInt(id)),
    });
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado" });
    }
    
    // Não permitir adicionar mensagens a tickets fechados
    if (ticket.status === "closed") {
      return res.status(400).json({ message: "Este ticket está fechado" });
    }
    
    // Inserir a nova mensagem
    const [newMessage] = await db.insert(supportMessages).values({
      ticketId: parseInt(id),
      senderId: req.user.id,
      senderType: "admin",
      message,
      attachmentUrl: attachmentUrl || null,
      createdAt: new Date(),
      isRead: false,
    }).returning();
    
    // Atualizar o status do ticket para "in_progress" se estiver "open"
    if (ticket.status === "open") {
      await db.update(supportTickets)
        .set({
          status: "in_progress",
          assignedToAdminId: req.user.id,
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, parseInt(id)));
    } else {
      // Apenas atualizar a data de atualização
      await db.update(supportTickets)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, parseInt(id)));
    }
    
    // Registrar ação de auditoria
    await logAuditAction(req, "update", "support_ticket", parseInt(id), {
      action: "message_sent",
      ticketId: parseInt(id),
    });
    
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);
    return res.status(500).json({ message: "Erro ao adicionar mensagem" });
  }
});

// Atualizar o status de um ticket
adminSupportRouter.patch("/tickets/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validações básicas
    if (!status || !["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }
    
    // Verificar se o ticket existe
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, parseInt(id)),
    });
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado" });
    }
    
    // Atualizar campos com base no novo status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    // Se estiver marcando como fechado, registrar a data de resolução
    if (status === "closed") {
      updateData.resolvedAt = new Date();
    }
    
    // Se estiver marcando como "in_progress" e não tiver um admin atribuído
    if (status === "in_progress" && !ticket.assignedToAdminId) {
      updateData.assignedToAdminId = req.user.id;
    }
    
    // Atualizar o ticket
    const [updatedTicket] = await db.update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, parseInt(id)))
      .returning();
    
    // Se estiver fechando o ticket, adicionar uma mensagem de sistema
    if (status === "closed" && ticket.status !== "closed") {
      await db.insert(supportMessages).values({
        ticketId: parseInt(id),
        senderId: req.user.id,
        senderType: "admin",
        message: "Este ticket foi marcado como resolvido e fechado.",
        createdAt: new Date(),
        isRead: false,
      });
    }
    
    // Registrar ação de auditoria
    await logAuditAction(req, "update", "support_ticket", parseInt(id), {
      action: "status_changed",
      oldStatus: ticket.status,
      newStatus: status,
    });
    
    return res.json(updatedTicket);
  } catch (error) {
    console.error("Erro ao atualizar status do ticket:", error);
    return res.status(500).json({ message: "Erro ao atualizar status do ticket" });
  }
});

// Atribuir um ticket a um administrador
adminSupportRouter.patch("/tickets/:id/assign", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    
    // Validações básicas
    if (!adminId) {
      return res.status(400).json({ message: "ID do administrador é obrigatório" });
    }
    
    // Verificar se o ticket existe
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, parseInt(id)),
    });
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado" });
    }
    
    // Verificar se o admin existe
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, parseInt(adminId)),
    });
    
    if (!admin) {
      return res.status(404).json({ message: "Administrador não encontrado" });
    }
    
    // Atualizar o ticket
    const [updatedTicket] = await db.update(supportTickets)
      .set({
        assignedToAdminId: parseInt(adminId),
        status: ticket.status === "open" ? "in_progress" : ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, parseInt(id)))
      .returning();
    
    // Registrar ação de auditoria
    await logAuditAction(req, "update", "support_ticket", parseInt(id), {
      action: "ticket_assigned",
      assignedTo: parseInt(adminId),
    });
    
    return res.json(updatedTicket);
  } catch (error) {
    console.error("Erro ao atribuir ticket:", error);
    return res.status(500).json({ message: "Erro ao atribuir ticket" });
  }
});

// Obter estatísticas de suporte (para dashboard)
adminSupportRouter.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Contagem de tickets por status
    const openTickets = await db.select().from(supportTickets)
      .where(eq(supportTickets.status, "open"))
      .count();
    
    const inProgressTickets = await db.select().from(supportTickets)
      .where(eq(supportTickets.status, "in_progress"))
      .count();
    
    const closedTicketsToday = await db.select().from(supportTickets)
      .where(and(
        eq(supportTickets.status, "closed"),
        gte(supportTickets.resolvedAt, new Date(new Date().setHours(0, 0, 0, 0)))
      ))
      .count();
    
    // Tempo médio de resolução (em horas)
    // Cálculo simplificado, pode ser expandido conforme necessário
    const avgResolutionTime = await db.select({
      avgTime: sql`AVG(EXTRACT(EPOCH FROM (${supportTickets.resolvedAt} - ${supportTickets.createdAt})) / 3600)`,
    }).from(supportTickets)
      .where(and(
        eq(supportTickets.status, "closed"),
        isNotNull(supportTickets.resolvedAt),
      ));
    
    // Tickets de alta prioridade não resolvidos
    const highPriorityUnresolved = await db.select().from(supportTickets)
      .where(and(
        eq(supportTickets.priority, "high"),
        or(
          eq(supportTickets.status, "open"),
          eq(supportTickets.status, "in_progress")
        )
      ))
      .count();
    
    // Estatísticas por categoria
    const ticketsByCategory = await db.select({
      category: supportTickets.category,
      count: sql`COUNT(*)`,
    }).from(supportTickets)
      .groupBy(supportTickets.category);
    
    return res.json({
      openCount: Number(openTickets[0].count),
      inProgressCount: Number(inProgressTickets[0].count),
      closedTodayCount: Number(closedTicketsToday[0].count),
      highPriorityCount: Number(highPriorityUnresolved[0].count),
      avgResolutionTimeHours: Number(avgResolutionTime[0].avgTime || 0).toFixed(1),
      byCategory: ticketsByCategory.map(item => ({
        category: item.category,
        count: Number(item.count),
      })),
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas de suporte:", error);
    return res.status(500).json({ message: "Erro ao obter estatísticas de suporte" });
  }
});