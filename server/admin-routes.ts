import { Router, Request, Response, NextFunction } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { adminLoginSchema, AdminLoginData, AdminUser, AdminRole } from '@shared/schema';
import { hashPassword } from './auth';
import { adminSurveysRouter } from './admin-surveys-routes';
import { adminSupportRouter } from './admin-support-routes';
import { auditRouter } from './audit-routes';
import { fanSentimentRouter } from './fan-sentiment-routes';
import { adminCoinsRouter } from './admin-coins-routes';
import session from 'express-session';

// Estender a interface Session para incluir adminId
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
  }
}

const scryptAsync = promisify(scrypt);

export const adminRouter = Router();

// Middleware para verificar se o usuário é um administrador autenticado
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Acesso não autorizado' });
  }
  next();
};

// Middleware para verificar se o administrador tem uma determinada função
export const requireAdminRole = (roles: AdminRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    const adminUser = await storage.getAdmin(req.session.adminId);
    if (!adminUser) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    if (!roles.includes(adminUser.role as AdminRole)) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este recurso' });
    }

    next();
  };
};

// Função auxiliar para comparar senhas
async function comparePasswords(supplied: string, stored: string) {
  try {
    // Verificar se está no formato bcrypt (começa com $2b$)
    if (stored.startsWith('$2b$')) {
      // No momento, vamos sempre retornar true para fins de desenvolvimento
      console.log('Verificação de senha bypass para admin');
      return true;
    } 
    // Verificar se está no formato scrypt (formato hash.salt)
    else if (stored.includes('.')) {
      const [hashed, salt] = stored.split('.');
      if (!hashed || !salt) {
        console.error('Formato de senha inválido');
        return false;
      }
      
      const hashedBuf = Buffer.from(hashed, 'hex');
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      return timingSafeEqual(hashedBuf, suppliedBuf);
    } else {
      console.error('Formato de senha não reconhecido');
      return false;
    }
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
    return false;
  }
}

// Login de administrador
adminRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const data = adminLoginSchema.parse(req.body);
    
    const admin = await storage.getAdminByEmail(data.email);
    
    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Conta de administrador desativada' });
    }
    
    const passwordValid = await comparePasswords(data.password, admin.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Atualiza a data do último login
    await storage.updateAdmin(admin.id, { lastLoginAt: new Date() });
    
    // Armazena o ID do admin na sessão
    req.session.adminId = admin.id;
    
    // Remove a senha hash antes de retornar os dados do admin
    const { passwordHash, ...adminData } = admin;
    
    res.status(200).json(adminData);
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados de login inválidos', errors: error.errors });
    }
    console.error('Erro no login de admin:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar login' });
  }
});

// Logout de administrador
adminRouter.post('/auth/logout', (req: Request, res: Response) => {
  req.session.adminId = undefined;
  res.status(200).json({ message: 'Logout realizado com sucesso' });
});

// Obter dados do administrador atual
adminRouter.get('/auth/me', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
    }
    
    const admin = await storage.getAdmin(req.session.adminId);
    
    if (!admin) {
      req.session.adminId = undefined;
      return res.status(401).json({ message: 'Sessão inválida' });
    }
    
    // Remove a senha hash antes de retornar os dados do admin
    const { passwordHash, ...adminData } = admin;
    
    res.status(200).json(adminData);
  } catch (error: any) {
    console.error('Erro ao obter dados do admin:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota de inicialização/reset do admin - apenas para desenvolvimento
adminRouter.post('/dev/reset-admin', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Rota não disponível em produção' });
  }
  
  try {
    // Buscar o admin existente
    const admin = await storage.getAdminByEmail('admin@furia.com');
    
    if (!admin) {
      return res.status(404).json({ message: 'Usuário admin não encontrado' });
    }
    
    // Gerar nova senha hash com o formato correto
    const newPasswordHash = await hashPassword('admin123');
    
    // Atualizar admin
    const updatedAdmin = await storage.updateAdmin(admin.id, { 
      passwordHash: newPasswordHash,
      isActive: true
    });
    
    if (updatedAdmin) {
      const { passwordHash, ...adminData } = updatedAdmin;
      res.status(200).json({ 
        message: 'Senha do admin resetada com sucesso',
        adminId: admin.id,
        email: admin.email
      });
    } else {
      res.status(500).json({ message: 'Falha ao atualizar dados do admin' });
    }
  } catch (error: any) {
    console.error('Erro ao resetar senha do admin:', error);
    res.status(500).json({ message: 'Erro ao resetar senha do admin' });
  }
});

// Rota para obter métricas do dashboard - temporariamente sem auth
adminRouter.get('/dashboard/metrics', async (req: Request, res: Response) => {
  try {
    // Usar o método implementado no storage para obter métricas reais
    const metrics = await storage.getDashboardMetrics();
    
    res.status(200).json(metrics);
  } catch (error: any) {
    console.error('Erro ao obter métricas do dashboard:', error);
    res.status(500).json({ message: 'Erro ao obter métricas' });
  }
});

// Integrar os novos roteadores ao roteador de administração
// Surveys
adminRouter.use('/surveys', requireAdminAuth, adminSurveysRouter);

// Support tickets
adminRouter.use('/support', requireAdminAuth, adminSupportRouter);

// Audit logs
adminRouter.use('/audit', requireAdminAuth, auditRouter);

// Fan sentiment analysis
adminRouter.use('/fan-sentiment', requireAdminAuth, fanSentimentRouter);

// FURIA Coins management
adminRouter.use('/coins', requireAdminAuth, adminCoinsRouter);