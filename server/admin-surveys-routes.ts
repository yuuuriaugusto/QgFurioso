import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { surveys, surveyQuestions, surveyResponses } from "../shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { logAuditAction } from "./audit-routes";

export const adminSurveysRouter = Router();

// Middleware para verificar se o usuário é administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Acesso não autorizado" });
  }
  next();
};

// Obter todas as pesquisas
adminSurveysRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const allSurveys = await db.query.surveys.findMany({
      orderBy: [desc(surveys.createdAt)],
      with: {
        questions: true,
      }
    });

    // Para cada pesquisa, vamos obter o número de respostas
    const surveysWithResponseCounts = await Promise.all(
      allSurveys.map(async (survey) => {
        const responseCount = await db.query.surveyResponses.findMany({
          where: eq(surveyResponses.surveyId, survey.id),
          columns: {
            id: true,
          }
        });

        return {
          ...survey,
          responseCount: responseCount.length,
          questionCount: survey.questions.length,
        };
      })
    );

    return res.json(surveysWithResponseCounts);
  } catch (error) {
    console.error("Erro ao obter pesquisas:", error);
    return res.status(500).json({ message: "Erro ao obter pesquisas" });
  }
});

// Obter uma pesquisa específica
adminSurveysRouter.get("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, parseInt(id)),
      with: {
        questions: {
          orderBy: [asc(surveyQuestions.orderIndex)]
        }
      }
    });

    if (!survey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }

    // Contar respostas
    const responseCount = await db.query.surveyResponses.findMany({
      where: eq(surveyResponses.surveyId, survey.id),
      columns: {
        id: true,
      }
    });

    return res.json({
      ...survey,
      responseCount: responseCount.length,
    });
  } catch (error) {
    console.error("Erro ao obter pesquisa:", error);
    return res.status(500).json({ message: "Erro ao obter pesquisa" });
  }
});

// Criar uma nova pesquisa
adminSurveysRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, reward, expirationDate, status, estimatedTimeMinutes, questions } = req.body;

    // Validações básicas
    if (!title || !description) {
      return res.status(400).json({ message: "Título e descrição são obrigatórios" });
    }

    // Inserir a pesquisa
    const [newSurvey] = await db.insert(surveys).values({
      title,
      description,
      reward: reward || 0,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      status: status || "draft",
      estimatedTimeMinutes: estimatedTimeMinutes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Se tiver perguntas, inserir
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionsWithSurveyId = questions.map((q, index) => ({
        surveyId: newSurvey.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        isRequired: q.isRequired !== undefined ? q.isRequired : true,
        orderIndex: index,
      }));

      await db.insert(surveyQuestions).values(questionsWithSurveyId);
    }

    // Registrar ação de auditoria
    await logAuditAction(req, "create", "survey", newSurvey.id, {
      title: newSurvey.title,
      status: newSurvey.status,
    });

    return res.status(201).json(newSurvey);
  } catch (error) {
    console.error("Erro ao criar pesquisa:", error);
    return res.status(500).json({ message: "Erro ao criar pesquisa" });
  }
});

// Atualizar uma pesquisa existente
adminSurveysRouter.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, reward, expirationDate, status, estimatedTimeMinutes, questions } = req.body;

    // Validações básicas
    if (!title || !description) {
      return res.status(400).json({ message: "Título e descrição são obrigatórios" });
    }

    // Verificar se a pesquisa existe
    const existingSurvey = await db.query.surveys.findFirst({
      where: eq(surveys.id, parseInt(id)),
    });

    if (!existingSurvey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }

    // Atualizar a pesquisa
    const [updatedSurvey] = await db.update(surveys)
      .set({
        title,
        description,
        reward: reward || 0,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        status: status || "draft",
        estimatedTimeMinutes: estimatedTimeMinutes || null,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, parseInt(id)))
      .returning();

    // Se tiver perguntas, atualizar
    if (questions && Array.isArray(questions)) {
      // Primeiro, remover todas as perguntas existentes
      await db.delete(surveyQuestions).where(eq(surveyQuestions.surveyId, parseInt(id)));

      // Depois, inserir as novas perguntas
      if (questions.length > 0) {
        const questionsWithSurveyId = questions.map((q, index) => ({
          surveyId: parseInt(id),
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          isRequired: q.isRequired !== undefined ? q.isRequired : true,
          orderIndex: index,
        }));

        await db.insert(surveyQuestions).values(questionsWithSurveyId);
      }
    }

    // Registrar ação de auditoria
    await logAuditAction(req, "update", "survey", parseInt(id), {
      title: updatedSurvey.title,
      status: updatedSurvey.status,
    });

    return res.json(updatedSurvey);
  } catch (error) {
    console.error("Erro ao atualizar pesquisa:", error);
    return res.status(500).json({ message: "Erro ao atualizar pesquisa" });
  }
});

// Excluir uma pesquisa
adminSurveysRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se a pesquisa existe
    const existingSurvey = await db.query.surveys.findFirst({
      where: eq(surveys.id, parseInt(id)),
    });

    if (!existingSurvey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }

    // Primeiro, excluir todas as perguntas associadas
    await db.delete(surveyQuestions).where(eq(surveyQuestions.surveyId, parseInt(id)));

    // Verificar se existem respostas
    const responses = await db.query.surveyResponses.findMany({
      where: eq(surveyResponses.surveyId, parseInt(id)),
      columns: {
        id: true,
      }
    });

    if (responses.length > 0) {
      // Não excluir a pesquisa, apenas marcar como inativa
      const [updatedSurvey] = await db.update(surveys)
        .set({
          status: "deleted",
          updatedAt: new Date(),
        })
        .where(eq(surveys.id, parseInt(id)))
        .returning();
      
      // Registrar ação de auditoria
      await logAuditAction(req, "update", "survey", parseInt(id), {
        action: "soft_delete",
        title: updatedSurvey.title,
      });

      return res.json({ message: "Pesquisa marcada como excluída" });
    } else {
      // Excluir a pesquisa completamente
      await db.delete(surveys).where(eq(surveys.id, parseInt(id)));
      
      // Registrar ação de auditoria
      await logAuditAction(req, "delete", "survey", parseInt(id), {
        title: existingSurvey.title,
      });

      return res.json({ message: "Pesquisa excluída com sucesso" });
    }
  } catch (error) {
    console.error("Erro ao excluir pesquisa:", error);
    return res.status(500).json({ message: "Erro ao excluir pesquisa" });
  }
});

// Obter estatísticas de uma pesquisa específica
adminSurveysRouter.get("/:id/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a pesquisa existe
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, parseInt(id)),
    });

    if (!survey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }

    // Obter todas as respostas
    const responses = await db.query.surveyResponses.findMany({
      where: eq(surveyResponses.surveyId, parseInt(id)),
    });

    // Calcular estatísticas básicas
    const stats = {
      totalResponses: responses.length,
      completionRate: 0,
      averageTimeMinutes: 0,
      responsesByDay: {},
    };

    // Implementação básica de estatísticas - pode ser expandida conforme necessário
    
    return res.json(stats);
  } catch (error) {
    console.error("Erro ao obter estatísticas da pesquisa:", error);
    return res.status(500).json({ message: "Erro ao obter estatísticas da pesquisa" });
  }
});