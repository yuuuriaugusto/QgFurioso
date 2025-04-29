import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, UserProfile, CoinBalance, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends User {
      profile?: UserProfile;
      coinBalance?: CoinBalance;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
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
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
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
      
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
        }
        
        req.login(user, async (loginErr) => {
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
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    next();
  };

  return { requireAuth };
}
