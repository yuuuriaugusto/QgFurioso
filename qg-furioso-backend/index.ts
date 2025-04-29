import express, { Express, Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import cors from "cors";
import http from "http";

async function main() {
  const PORT = process.env.PORT || 5000;
  const app: Express = express();
  
  // Configuração CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }));
  
  // Middlewares
  app.use(express.json());
  
  // Rotas
  const server = await registerRoutes(app);
  
  // Tratamento global de erros
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    
    return res.status(err.status || 500).json({
      message: err.message || "Erro interno do servidor",
    });
  });
  
  // Iniciar servidor
  server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Criar usuário de teste ao iniciar o aplicativo
import { createTestUser } from "./auth";

async function init() {
  try {
    await createTestUser();
    console.log("Usuário de teste criado com sucesso.");
  } catch (error) {
    if (error instanceof Error) {
      console.log("Usuário de teste já existe.");
    } else {
      console.error("Erro ao criar usuário de teste:", error);
    }
  }
}

main().catch(console.error);
init().catch(console.error);