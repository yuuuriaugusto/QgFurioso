import { Router, Request, Response, NextFunction } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { adminLoginSchema, AdminLoginData, AdminUser, AdminRole } from '@shared/schema';

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
    const [hashed, salt] = stored.split('.');
    if (!hashed || !salt) {
      console.error('Formato de senha inválido');
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error('Comprimentos de buffer diferentes:', hashedBuf.length, suppliedBuf.length);
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
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
  } catch (error) {
    if (error.name === 'ZodError') {
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
    const admin = await storage.getAdmin(req.session.adminId);
    
    if (!admin) {
      req.session.adminId = undefined;
      return res.status(401).json({ message: 'Sessão inválida' });
    }
    
    // Remove a senha hash antes de retornar os dados do admin
    const { passwordHash, ...adminData } = admin;
    
    res.status(200).json(adminData);
  } catch (error) {
    console.error('Erro ao obter dados do admin:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para obter métricas do dashboard
adminRouter.get('/dashboard/metrics', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    // Aqui você pode implementar a lógica para obter métricas
    // Exemplo simplificado:
    const metrics = {
      totalUsers: 0,
      activeUsers: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      newRegistrations: {
        last24h: 0,
        last7d: 0,
        last30d: 0
      },
      totalCoins: {
        inCirculation: 0,
        earned: 0,
        spent: 0
      },
      pendingRedemptions: 0
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Erro ao obter métricas do dashboard:', error);
    res.status(500).json({ message: 'Erro ao obter métricas' });
  }
});