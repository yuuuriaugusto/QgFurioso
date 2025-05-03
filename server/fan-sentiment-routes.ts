import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { fanSentiments } from "../shared/schema";
import { eq, desc, and, between, gte, lte, count, sql } from "drizzle-orm";
import { logAuditAction } from "./audit-routes";

export const fanSentimentRouter = Router();

// Middleware para verificar se o usuário é administrador
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Acesso não autorizado" });
  }
  next();
};

// Obter todas as entradas de sentimento
fanSentimentRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { source, sentiment, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // Construir a query com base nos filtros
    let query = db.select().from(fanSentiments);
    
    if (source) {
      query = query.where(eq(fanSentiments.source, source as string));
    }
    
    if (sentiment) {
      query = query.where(eq(fanSentiments.sentiment, sentiment as string));
    }
    
    // Filtro por data
    if (startDate && endDate) {
      query = query.where(
        between(
          fanSentiments.date, 
          new Date(startDate as string), 
          new Date(endDate as string)
        )
      );
    } else if (startDate) {
      query = query.where(gte(fanSentiments.date, new Date(startDate as string)));
    } else if (endDate) {
      query = query.where(lte(fanSentiments.date, new Date(endDate as string)));
    }
    
    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedQuery = query.limit(Number(limit)).offset(offset).orderBy(desc(fanSentiments.date));
    
    // Executar consulta
    const sentiments = await paginatedQuery;
    
    // Contar total para paginação
    const countResult = await db.select({ count: count() }).from(fanSentiments);
    const total = Number(countResult[0]?.count || 0);
    
    // Registrar esta consulta no log de auditoria
    await logAuditAction(req, "view", "fan_sentiment");
    
    return res.json({
      data: sentiments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao obter dados de sentimento:", error);
    return res.status(500).json({ message: "Erro ao obter dados de sentimento" });
  }
});

// Resumo/dashboard de sentimentos
fanSentimentRouter.get("/summary", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Filtro de data para as consultas
    let dateFilter = sql`1=1`;
    if (startDate && endDate) {
      dateFilter = between(
        fanSentiments.date, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
    } else if (startDate) {
      dateFilter = gte(fanSentiments.date, new Date(startDate as string));
    } else if (endDate) {
      dateFilter = lte(fanSentiments.date, new Date(endDate as string));
    }
    
    // Contagens por sentimento
    const sentimentCounts = await db
      .select({
        sentiment: fanSentiments.sentiment,
        count: count(),
      })
      .from(fanSentiments)
      .where(dateFilter)
      .groupBy(fanSentiments.sentiment);
    
    // Contagens por fonte
    const sourceCounts = await db
      .select({
        source: fanSentiments.source,
        count: count(),
      })
      .from(fanSentiments)
      .where(dateFilter)
      .groupBy(fanSentiments.source);
    
    // Sentimento médio
    const averageSentiment = await db
      .select({
        average: sql`AVG(${fanSentiments.sentimentScore})`,
      })
      .from(fanSentiments)
      .where(dateFilter);
    
    // Evolução do sentimento ao longo do tempo (último mês por padrão)
    const sentimentOverTime = await db
      .select({
        date: sql`DATE_TRUNC('day', ${fanSentiments.date})`,
        average: sql`AVG(${fanSentiments.sentimentScore})`,
        positive: sql`COUNT(CASE WHEN ${fanSentiments.sentiment} = 'positive' THEN 1 END)`,
        neutral: sql`COUNT(CASE WHEN ${fanSentiments.sentiment} = 'neutral' THEN 1 END)`,
        negative: sql`COUNT(CASE WHEN ${fanSentiments.sentiment} = 'negative' THEN 1 END)`,
      })
      .from(fanSentiments)
      .where(dateFilter)
      .groupBy(sql`DATE_TRUNC('day', ${fanSentiments.date})`)
      .orderBy(sql`DATE_TRUNC('day', ${fanSentiments.date})`);
    
    // Top tópicos
    const topTopics = await db
      .execute(sql`
        SELECT t.topic, COUNT(*) as count, MAX(${fanSentiments.date}) as latest_date
        FROM ${fanSentiments}
        CROSS JOIN LATERAL jsonb_array_elements_text(${fanSentiments.topics}) as t(topic)
        WHERE ${dateFilter}
        GROUP BY t.topic
        ORDER BY count DESC
        LIMIT 10
      `);
    
    return res.json({
      sentimentCounts,
      sourceCounts,
      averageSentiment: Number(averageSentiment[0]?.average || 0),
      sentimentOverTime,
      topTopics,
    });
  } catch (error) {
    console.error("Erro ao obter resumo de sentimentos:", error);
    return res.status(500).json({ message: "Erro ao obter resumo de sentimentos" });
  }
});

// Analisar texto para sentimento
fanSentimentRouter.post("/analyze", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { content, source = "manual", sourceId, relatedEntityType, relatedEntityId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Conteúdo é obrigatório" });
    }

    // Aqui, em um ambiente de produção, você chamaria a API OpenAI para análise
    // Como estamos sem a chave API, vamos simular a análise
    
    // Simulação básica de análise de sentimentos (em produção, usar OpenAI)
    const sentimentAnalysis = simulateSentimentAnalysis(content);
    
    // Registrar o resultado no banco de dados
    const [newSentiment] = await db.insert(fanSentiments).values({
      source,
      sourceId: sourceId || null,
      content,
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: sentimentAnalysis.score,
      topics: sentimentAnalysis.topics,
      date: new Date(),
      platform: source,
      relatedEntityType: relatedEntityType || null,
      relatedEntityId: relatedEntityId || null,
      createdAt: new Date(),
    }).returning();
    
    // Registrar ação de auditoria
    await logAuditAction(req, "create", "fan_sentiment", newSentiment.id, {
      method: "manual_analysis",
      source,
    });
    
    return res.status(201).json(newSentiment);
  } catch (error) {
    console.error("Erro ao analisar sentimento:", error);
    return res.status(500).json({ message: "Erro ao analisar sentimento" });
  }
});

// Importar dados de sentimento (simulação para o front-end)
fanSentimentRouter.post("/import", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { source, platform, query, dateRange } = req.body;
    
    if (!source || !platform) {
      return res.status(400).json({ message: "Fonte e plataforma são obrigatórios" });
    }
    
    // Aqui, em produção, você conectaria às APIs das redes sociais
    // Como estamos sem chaves API, vamos simular os dados importados
    
    // Registrar a importação no log de auditoria
    await logAuditAction(req, "create", "fan_sentiment", undefined, {
      method: "import",
      source,
      platform,
      query,
      dateRange,
    });
    
    return res.json({
      success: true,
      message: "Importação iniciada com sucesso. Os dados serão processados em segundo plano.",
      importId: "import_" + Date.now(),
    });
  } catch (error) {
    console.error("Erro ao importar dados de sentimento:", error);
    return res.status(500).json({ message: "Erro ao importar dados de sentimento" });
  }
});

// Excluir entrada de sentimento
fanSentimentRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o registro existe
    const sentiment = await db.query.fanSentiments.findFirst({
      where: eq(fanSentiments.id, parseInt(id)),
    });
    
    if (!sentiment) {
      return res.status(404).json({ message: "Registro não encontrado" });
    }
    
    // Excluir o registro
    await db.delete(fanSentiments).where(eq(fanSentiments.id, parseInt(id)));
    
    // Registrar ação de auditoria
    await logAuditAction(req, "delete", "fan_sentiment", parseInt(id), {
      content: sentiment.content.substring(0, 100) + (sentiment.content.length > 100 ? "..." : ""),
    });
    
    return res.json({ message: "Registro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir registro de sentimento:", error);
    return res.status(500).json({ message: "Erro ao excluir registro de sentimento" });
  }
});

// Simulador simples de análise de sentimentos (para uso sem a API OpenAI)
function simulateSentimentAnalysis(text: string) {
  // Palavras-chave positivas
  const positiveWords = ["bom", "ótimo", "excelente", "incrível", "gosto", "amei", "parabéns", "top", "melhor", "fantástico", "gostei"];
  // Palavras-chave negativas
  const negativeWords = ["ruim", "péssimo", "terrível", "horrível", "não gosto", "odiei", "decepcionado", "lamentável", "pior", "problema", "decepção"];
  
  // Converter para minúsculas para comparação
  const lowerText = text.toLowerCase();
  
  // Contar ocorrências
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  // Determinar sentimento e pontuação
  let sentiment: "positive" | "neutral" | "negative";
  let score: number;
  
  if (positiveCount > negativeCount) {
    sentiment = "positive";
    score = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
    score = Math.max(-0.9, -0.5 - (negativeCount - positiveCount) * 0.1);
  } else {
    sentiment = "neutral";
    score = 0;
  }
  
  // Extração simples de tópicos
  const words = lowerText.split(/\s+/).filter(word => word.length > 3);
  const uniqueWords = [...new Set(words)];
  const topics = uniqueWords.slice(0, 5); // Pegar até 5 palavras como "tópicos"
  
  return {
    sentiment,
    score,
    topics,
  };
}