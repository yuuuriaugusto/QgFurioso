import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, UserProfile, CoinBalance, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    // Extend the default Express User
    interface User {
      id: number;
      publicId: string;
      primaryIdentity: string;
      identityType: string;
      passwordHash: string;
      status: string;
      lastLoginAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      profile?: UserProfile;
      coinBalance?: CoinBalance;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Função para criar um usuário de teste
export async function createTestUser() {
  try {
    // Verificar se já existe o usuário de teste
    const existingUser = await storage.getUserByPrimaryIdentity("teste@furia.com");
    if (existingUser) {
      console.log("Usuário de teste já existe.");
      return;
    }

    console.log("Criando usuário de teste...");
    
    // Criar hash da senha
    const passwordHash = await hashPassword("furiafan123");
    
    // Criar o usuário
    const user = await storage.createUser({
      primaryIdentity: "teste@furia.com",
      identityType: "email",
      passwordHash,
      status: "active",
    });
    
    // Criar perfil
    const profile = await storage.createUserProfile(user.id, {
      firstName: "Furia",
      lastName: "Fan",
      birthDate: "1995-10-15",
      cpfEncrypted: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: "São Paulo",
      addressState: null,
      addressZipCode: null,
      interests: null,
      activitiesEvents: null,
      avatarUrl: "https://via.placeholder.com/150x150.png?text=FF"
    });
    
    // Criar preferências
    await storage.createUserPreferences(user.id, {
      emailNotifications: true,
      pushNotifications: true,
      marketingConsent: false,
      theme: "dark",
      language: "pt-BR"
    });
    
    // Criar saldo de moedas
    const coinBalance = await storage.createCoinBalance(user.id);
    
    // Adicionar transações de teste
    await storage.createCoinTransaction(user.id, {
      userId: user.id,
      amount: 500,
      transactionType: "earning",
      description: "Bônus de cadastro",
      relatedEntityType: null,
      relatedEntityId: null
    });
    
    await storage.createCoinTransaction(user.id, {
      userId: user.id,
      amount: 250,
      transactionType: "earning",
      description: "Pesquisa completa",
      relatedEntityType: "survey",
      relatedEntityId: 1
    });
    
    // Criar itens de loja de teste
    const shopItems = [
      {
        name: "FURIA Jersey 2024",
        description: "Camisa oficial da FURIA para 2024",
        imageUrl: "https://via.placeholder.com/300x300.png?text=FURIA+Jersey",
        coinPrice: 500,
        type: "physical",
        stock: 100,
        isActive: true
      },
      {
        name: "FURIA Cap",
        description: "Boné exclusivo FURIA Esports",
        imageUrl: "https://via.placeholder.com/300x300.png?text=FURIA+Cap",
        coinPrice: 300,
        type: "physical",
        stock: 150,
        isActive: true
      },
      {
        name: "Pacote VIP - Próximo Evento",
        description: "Acesso VIP para o próximo evento da FURIA, inclui meet & greet",
        imageUrl: "https://via.placeholder.com/300x300.png?text=VIP+Package",
        coinPrice: 2000,
        type: "digital",
        stock: 10,
        isActive: true
      }
    ];
    
    for (const item of shopItems) {
      await storage.createShopItem(item);
    }
    
    // Criar notícias de teste
    const newsContents = [
      {
        title: "FURIA anuncia nova lineup para IEM Katowice 2024",
        slug: "furia-anuncia-nova-lineup",
        content: "A organização brasileira FURIA Esports revelou hoje sua nova formação para o próximo major. A equipe conta com a adição de um novo jogador...",
        excerpt: "A organização brasileira FURIA Esports revelou hoje sua nova formação para o próximo major.",
        imageUrl: "https://via.placeholder.com/800x400.png?text=FURIA+CS2+Team",
        category: "CS2",
        authorId: null,
        publishDate: new Date(),
        isPublished: true
      },
      {
        title: "FURIA Valorant conquista título do VALORANT Masters São Paulo",
        slug: "furia-valorant-conquista-titulo",
        content: "Em uma final emocionante, a equipe da FURIA venceu por 3-1 e garantiu o primeiro título internacional para o Brasil...",
        excerpt: "Em uma final emocionante, a equipe da FURIA venceu por 3-1 e garantiu o primeiro título internacional para o Brasil.",
        imageUrl: "https://via.placeholder.com/800x400.png?text=FURIA+Valorant+Team",
        category: "VALORANT",
        authorId: null,
        publishDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        isPublished: true
      }
    ];
    
    for (const content of newsContents) {
      await storage.createNewsContent(content);
    }
    
    console.log("Usuário de teste criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar usuário de teste:", error);
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "furia-qg-furioso-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "primaryIdentity",
        passwordField: "password",
      },
      async (primaryIdentity, password, done) => {
        try {
          const user = await storage.getUserByPrimaryIdentity(primaryIdentity);
          if (!user || !(await comparePasswords(password, user.passwordHash))) {
            return done(null, false, { message: "Credenciais inválidas" });
          }
          
          // Update last login
          await storage.updateUser(user.id, { lastLoginAt: new Date() });
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Get user profile and coin balance
      const profile = await storage.getUserProfile(user.id);
      const coinBalance = await storage.getCoinBalance(user.id);
      
      // Combine user data for easier access
      const userData = {
        ...user,
        profile,
        coinBalance
      };
      
      done(null, userData);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByPrimaryIdentity(validatedData.primaryIdentity);
      if (existingUser) {
        return res.status(400).json({ message: "Este identificador já está em uso" });
      }
      
      // Create user
      const passwordHash = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        primaryIdentity: validatedData.primaryIdentity,
        identityType: validatedData.identityType,
        passwordHash,
        status: "active", // Auto-activate for now
      });
      
      // Create empty profile
      const profile = await storage.createUserProfile(user.id, {
        firstName: null,
        lastName: null,
        birthDate: validatedData.birthDate || null,
        cpfEncrypted: null,
        addressStreet: null,
        addressNumber: null,
        addressComplement: null,
        addressNeighborhood: null,
        addressCity: null,
        addressState: null,
        addressZipCode: null,
        interests: null,
        activitiesEvents: null,
        avatarUrl: null
      });
      
      // Create user preferences
      const preferences = await storage.createUserPreferences(user.id, {
        emailNotifications: true,
        pushNotifications: true,
        marketingConsent: false,
        theme: "dark",
        language: "pt-BR"
      });
      
      // Create coin balance
      const coinBalance = await storage.createCoinBalance(user.id);
      
      // Add welcome bonus
      await storage.createCoinTransaction(user.id, {
        userId: user.id,
        amount: 100,
        transactionType: "signup_bonus",
        description: "Bônus de boas-vindas ao QG FURIOSO",
        relatedEntityType: null,
        relatedEntityId: null
      });
      
      // Log the user in
      req.login({ ...user, profile, coinBalance }, (err) => {
        if (err) return next(err);
        
        return res.status(201).json({
          id: user.id,
          primaryIdentity: user.primaryIdentity,
          status: user.status,
          profile,
          coinBalance: {
            ...coinBalance,
            balance: 100 // Updated with welcome bonus
          }
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de registro inválidos", 
          details: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      // Validate request body
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: User, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
        }
        
        req.login(user, async (loginErr: any) => {
          if (loginErr) return next(loginErr);
          
          // Get additional user data
          const profile = await storage.getUserProfile(user.id);
          const coinBalance = await storage.getCoinBalance(user.id);
          
          return res.status(200).json({
            id: user.id,
            primaryIdentity: user.primaryIdentity,
            status: user.status,
            profile,
            coinBalance
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de login inválidos", 
          details: fromZodError(error).message 
        });
      }
      next(error);
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Error destroying session:", sessionErr);
        }
        res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    const user = req.user;
    res.json({
      id: user.id,
      primaryIdentity: user.primaryIdentity,
      status: user.status,
      profile: user.profile,
      coinBalance: user.coinBalance
    });
  });

  // Verify that the user is authenticated middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    next();
  };

  return { requireAuth };
}
