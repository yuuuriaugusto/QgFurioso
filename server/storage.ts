import { 
  User, InsertUser, UserProfile, InsertUserProfile, UserPreferences, InsertUserPreferences,
  SocialLink, InsertSocialLink, KycVerification, InsertKycVerification, EsportsProfile, InsertEsportsProfile,
  CoinBalance, CoinTransaction, InsertCoinTransaction, ShopItem, InsertShopItem, RedemptionOrder, InsertRedemptionOrder,
  NewsContent, InsertNewsContent, Match, InsertMatch, Stream, InsertStream,
  Survey, InsertSurvey, SurveyQuestion, InsertSurveyQuestion, SurveyResponse, InsertSurveyResponse
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByPrimaryIdentity(primaryIdentity: string): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // User profiles
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(userId: number, profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(userId: number, preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  // Social links
  getSocialLinks(userId: number): Promise<SocialLink[]>;
  getSocialLinkByPlatform(userId: number, platform: string): Promise<SocialLink | undefined>;
  createSocialLink(userId: number, socialLink: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  
  // KYC verifications
  getKycVerification(userId: number): Promise<KycVerification | undefined>;
  createKycVerification(userId: number, verification: InsertKycVerification): Promise<KycVerification>;
  updateKycVerification(id: number, data: Partial<InsertKycVerification>): Promise<KycVerification | undefined>;
  
  // Esports profiles
  getEsportsProfiles(userId: number): Promise<EsportsProfile[]>;
  createEsportsProfile(userId: number, profile: InsertEsportsProfile): Promise<EsportsProfile>;
  updateEsportsProfile(id: number, data: Partial<InsertEsportsProfile>): Promise<EsportsProfile | undefined>;
  deleteEsportsProfile(id: number): Promise<boolean>;
  
  // Coin management
  getCoinBalance(userId: number): Promise<CoinBalance | undefined>;
  createCoinBalance(userId: number): Promise<CoinBalance>;
  updateCoinBalance(userId: number, amount: number): Promise<CoinBalance | undefined>;
  getCoinTransactions(userId: number, limit?: number): Promise<CoinTransaction[]>;
  createCoinTransaction(userId: number, transaction: InsertCoinTransaction): Promise<CoinTransaction>;
  
  // Shop items
  getShopItems(filters?: { isActive?: boolean }): Promise<ShopItem[]>;
  getShopItem(id: number): Promise<ShopItem | undefined>;
  createShopItem(item: InsertShopItem): Promise<ShopItem>;
  updateShopItem(id: number, data: Partial<InsertShopItem>): Promise<ShopItem | undefined>;
  
  // Redemptions
  getRedemptionOrders(userId: number): Promise<RedemptionOrder[]>;
  getRedemptionOrder(id: number): Promise<RedemptionOrder | undefined>;
  createRedemptionOrder(userId: number, order: InsertRedemptionOrder): Promise<RedemptionOrder>;
  updateRedemptionOrder(id: number, data: Partial<InsertRedemptionOrder>): Promise<RedemptionOrder | undefined>;
  
  // News content
  getNewsContent(filters?: { isPublished?: boolean, category?: string, limit?: number }): Promise<NewsContent[]>;
  getNewsContentBySlug(slug: string): Promise<NewsContent | undefined>;
  getNewsContentById(id: number): Promise<NewsContent | undefined>;
  createNewsContent(content: InsertNewsContent): Promise<NewsContent>;
  updateNewsContent(id: number, data: Partial<InsertNewsContent>): Promise<NewsContent | undefined>;
  
  // Matches
  getMatches(filters?: { status?: string, game?: string, limit?: number }): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match | undefined>;
  
  // Streams
  getStreams(filters?: { status?: string, limit?: number }): Promise<Stream[]>;
  getStream(id: number): Promise<Stream | undefined>;
  createStream(stream: InsertStream): Promise<Stream>;
  updateStream(id: number, data: Partial<InsertStream>): Promise<Stream | undefined>;
  
  // Surveys
  getSurveys(filters?: { status?: string, userId?: number, responded?: boolean }): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, data: Partial<InsertSurvey>): Promise<Survey | undefined>;
  
  // Survey questions
  getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]>;
  createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion>;
  
  // Survey responses
  getSurveyResponses(surveyId: number): Promise<SurveyResponse[]>;
  getUserSurveyResponses(userId: number): Promise<SurveyResponse[]>;
  getSurveyResponseById(id: number): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  updateSurveyResponse(id: number, data: Partial<InsertSurveyResponse>): Promise<SurveyResponse | undefined>;
  hasUserRespondedToSurvey(userId: number, surveyId: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private userPreferences: Map<number, UserPreferences>;
  private socialLinks: Map<number, SocialLink>;
  private kycVerifications: Map<number, KycVerification>;
  private esportsProfiles: Map<number, EsportsProfile>;
  private coinBalances: Map<number, CoinBalance>;
  private coinTransactions: Map<number, CoinTransaction>;
  private shopItems: Map<number, ShopItem>;
  private redemptionOrders: Map<number, RedemptionOrder>;
  private newsContents: Map<number, NewsContent>;
  private matches: Map<number, Match>;
  private streams: Map<number, Stream>;
  private surveys: Map<number, Survey>;
  private surveyQuestions: Map<number, SurveyQuestion>;
  private surveyResponses: Map<number, SurveyResponse>;
  
  currentId: {
    users: number;
    socialLinks: number;
    kycVerifications: number;
    esportsProfiles: number;
    coinTransactions: number;
    shopItems: number;
    redemptionOrders: number;
    newsContents: number;
    matches: number;
    streams: number;
    surveys: number;
    surveyQuestions: number;
    surveyResponses: number;
  };
  
  sessionStore: session.SessionStore;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.userProfiles = new Map();
    this.userPreferences = new Map();
    this.socialLinks = new Map();
    this.kycVerifications = new Map();
    this.esportsProfiles = new Map();
    this.coinBalances = new Map();
    this.coinTransactions = new Map();
    this.shopItems = new Map();
    this.redemptionOrders = new Map();
    this.newsContents = new Map();
    this.matches = new Map();
    this.streams = new Map();
    this.surveys = new Map();
    this.surveyQuestions = new Map();
    this.surveyResponses = new Map();
    
    // Initialize IDs
    this.currentId = {
      users: 1,
      socialLinks: 1,
      kycVerifications: 1,
      esportsProfiles: 1,
      coinTransactions: 1,
      shopItems: 1,
      redemptionOrders: 1,
      newsContents: 1,
      matches: 1,
      streams: 1,
      surveys: 1,
      surveyQuestions: 1,
      surveyResponses: 1
    };
    
    // Setup session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add sample data
    this.initializeData();
  }
  
  private initializeData(): void {
    // Add a test user
    const testUser: InsertUser & { passwordHash: string } = {
      primaryIdentity: "teste@furia.com",
      identityType: "email",
      passwordHash: "$2b$10$2xZuGKKkPx2z3/8vIkMsGusB08c0xgG2zxuQPbiiKt9LTsJrV.j6W", // senha: furiafan123
      status: "active"
    };
    
    const user = this.createUser(testUser);
    
    // Add user profile
    this.createUserProfile(user.id, {
      userId: user.id,
      firstName: "Furia",
      lastName: "Fan",
      birthDate: "1995-10-15",
      gender: "preferNotToSay",
      country: "Brasil",
      city: "São Paulo",
      avatarUrl: "https://via.placeholder.com/150x150.png?text=FF"
    });
    
    // Add coin balance
    const coinBalance = this.createCoinBalance(user.id);
    
    // Add some transactions
    this.createCoinTransaction(user.id, {
      userId: user.id,
      amount: 500,
      transactionType: "earning",
      description: "Bônus de cadastro",
      relatedEntityType: null,
      relatedEntityId: null
    });
    
    this.createCoinTransaction(user.id, {
      userId: user.id,
      amount: 250,
      transactionType: "earning",
      description: "Pesquisa completa",
      relatedEntityType: "survey",
      relatedEntityId: 1
    });
    
    // Update balance
    this.updateCoinBalance(user.id, 750);
    
    // Add initial shop items
    const shopItems: InsertShopItem[] = [
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
    
    shopItems.forEach(item => this.createShopItem(item));
    
    // Add initial news content
    const newsContents: InsertNewsContent[] = [
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
        publishDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        isPublished: true
      },
      {
        title: "Nova coleção de roupas FURIA x Adidas já está disponível",
        slug: "nova-colecao-furia-adidas",
        content: "A colaboração entre FURIA e Adidas traz uma linha exclusiva de roupas e acessórios. Disponível na loja online e nas lojas físicas...",
        excerpt: "A colaboração entre FURIA e Adidas traz uma linha exclusiva de roupas e acessórios.",
        imageUrl: "https://via.placeholder.com/800x400.png?text=FURIA+Adidas+Collection",
        category: "MERCHANDISE",
        authorId: null,
        publishDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        isPublished: true
      }
    ];
    
    newsContents.forEach(content => this.createNewsContent(content));
    
    // Add initial matches
    const matches: InsertMatch[] = [
      {
        game: "CS2",
        tournamentName: "IEM Katowice 2024",
        teamOneName: "FURIA",
        teamOneLogoUrl: "https://via.placeholder.com/80x80.png?text=FURIA",
        teamOneCountry: "Brasil",
        teamTwoName: "NaVi",
        teamTwoLogoUrl: "https://via.placeholder.com/80x80.png?text=NaVi",
        teamTwoCountry: "Ucrânia",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        result: null,
        status: "upcoming",
        streamUrl: "https://twitch.tv/esl_csgo",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        game: "VALORANT",
        tournamentName: "VCT Americas 2024",
        teamOneName: "FURIA",
        teamOneLogoUrl: "https://via.placeholder.com/80x80.png?text=FURIA",
        teamOneCountry: "Brasil",
        teamTwoName: "Sentinels",
        teamTwoLogoUrl: "https://via.placeholder.com/80x80.png?text=Sentinels",
        teamTwoCountry: "Estados Unidos",
        scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        result: null,
        status: "upcoming",
        streamUrl: "https://twitch.tv/valorant",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    matches.forEach(match => this.createMatch(match));
    
    // Add initial streams
    const streams: InsertStream[] = [
      {
        platform: "twitch",
        channelId: "furia_kscerato",
        streamUrl: "https://twitch.tv/furia_kscerato",
        title: "Treino para IEM Katowice - Praticando com o time",
        thumbnailUrl: "https://via.placeholder.com/600x300.png?text=FURIA+Stream",
        game: "Counter-Strike 2",
        streamerName: "FURIA kscerato",
        streamerAvatarUrl: "https://via.placeholder.com/80x80.png?text=Kscerato",
        status: "live",
        viewerCount: 2400,
        lastCheckedAt: new Date()
      },
      {
        platform: "twitch",
        channelId: "furia_art",
        streamUrl: "https://twitch.tv/furia_art",
        title: "Jogando matchmaking com subs - !sorteio de skin hoje",
        thumbnailUrl: "https://via.placeholder.com/600x300.png?text=FURIA+Stream",
        game: "Counter-Strike 2",
        streamerName: "FURIA art",
        streamerAvatarUrl: "https://via.placeholder.com/80x80.png?text=Art",
        status: "live",
        viewerCount: 1800,
        lastCheckedAt: new Date()
      }
    ];
    
    streams.forEach(stream => this.createStream(stream));
    
    // Add initial surveys
    const surveys: InsertSurvey[] = [
      {
        title: "Sua experiência com produtos FURIA",
        description: "Compartilhe sua opinião sobre nossos produtos e ajude-nos a melhorar. Esta pesquisa leva aproximadamente 5 minutos.",
        reward: 50,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "active",
        estimatedTimeMinutes: 5
      },
      {
        title: "Preferências de conteúdo na Twitch",
        description: "Ajude-nos a entender que tipo de streams você prefere assistir. Esta pesquisa rápida leva menos de 2 minutos.",
        reward: 25,
        expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: "active",
        estimatedTimeMinutes: 2
      }
    ];
    
    surveys.forEach(survey => {
      const createdSurvey = this.createSurvey(survey);
      
      // Add questions for the first survey
      if (createdSurvey.id === 1) {
        this.createSurveyQuestion({
          surveyId: createdSurvey.id,
          questionText: "Qual produto da FURIA você comprou mais recentemente?",
          questionType: "multiple_choice",
          options: ["Jersey", "Moletom", "Boné", "Mousepad", "Outro"],
          isRequired: true,
          orderIndex: 1
        });
        
        this.createSurveyQuestion({
          surveyId: createdSurvey.id,
          questionText: "Como você avalia a qualidade do produto?",
          questionType: "rating",
          options: ["1", "2", "3", "4", "5"],
          isRequired: true,
          orderIndex: 2
        });
        
        this.createSurveyQuestion({
          surveyId: createdSurvey.id,
          questionText: "Quais outros produtos você gostaria de ver na loja da FURIA?",
          questionType: "text",
          options: null,
          isRequired: false,
          orderIndex: 3
        });
      }
      
      // Add questions for the second survey
      if (createdSurvey.id === 2) {
        this.createSurveyQuestion({
          surveyId: createdSurvey.id,
          questionText: "Quantas horas por semana você assiste aos streams da FURIA?",
          questionType: "multiple_choice",
          options: ["Menos de 1 hora", "1-3 horas", "4-7 horas", "8-14 horas", "Mais de 15 horas"],
          isRequired: true,
          orderIndex: 1
        });
        
        this.createSurveyQuestion({
          surveyId: createdSurvey.id,
          questionText: "Qual tipo de conteúdo você mais gosta de assistir?",
          questionType: "multiple_choice",
          options: ["Gameplay competitivo", "Sessões de treino", "Conversas com fãs", "Behind the scenes", "Conteúdo casual"],
          isRequired: true,
          orderIndex: 2
        });
      }
    });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPrimaryIdentity(primaryIdentity: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.primaryIdentity === primaryIdentity
    );
  }

  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = {
      id,
      publicId: crypto.randomUUID(),
      primaryIdentity: userData.primaryIdentity,
      identityType: userData.identityType,
      passwordHash: userData.passwordHash,
      status: userData.status || "pending_verification",
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...data, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // User profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return this.userProfiles.get(userId);
  }

  async createUserProfile(userId: number, profile: InsertUserProfile): Promise<UserProfile> {
    const userProfile: UserProfile = {
      userId,
      ...profile
    };
    this.userProfiles.set(userId, userProfile);
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existingProfile = this.userProfiles.get(userId);
    if (!existingProfile) return undefined;
    
    const updatedProfile = { 
      ...existingProfile, 
      ...profile 
    };
    this.userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async createUserPreferences(userId: number, preferences: InsertUserPreferences): Promise<UserPreferences> {
    const userPreferences: UserPreferences = {
      userId,
      emailNotifications: preferences.emailNotifications ?? true,
      pushNotifications: preferences.pushNotifications ?? true,
      marketingConsent: preferences.marketingConsent ?? false,
      theme: preferences.theme ?? "dark",
      language: preferences.language ?? "pt-BR"
    };
    this.userPreferences.set(userId, userPreferences);
    return userPreferences;
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const existingPreferences = this.userPreferences.get(userId);
    if (!existingPreferences) return undefined;
    
    const updatedPreferences = { 
      ...existingPreferences, 
      ...preferences 
    };
    this.userPreferences.set(userId, updatedPreferences);
    return updatedPreferences;
  }

  // Social links methods
  async getSocialLinks(userId: number): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values()).filter(
      (link) => link.userId === userId
    );
  }

  async getSocialLinkByPlatform(userId: number, platform: string): Promise<SocialLink | undefined> {
    return Array.from(this.socialLinks.values()).find(
      (link) => link.userId === userId && link.platform === platform
    );
  }

  async createSocialLink(userId: number, socialLink: InsertSocialLink): Promise<SocialLink> {
    const id = this.currentId.socialLinks++;
    const now = new Date();
    const link: SocialLink = {
      id,
      userId,
      platform: socialLink.platform,
      platformUserId: socialLink.platformUserId,
      accessToken: socialLink.accessToken,
      refreshToken: socialLink.refreshToken || null,
      tokenExpiry: socialLink.tokenExpiry || null,
      username: socialLink.username || null,
      profileUrl: socialLink.profileUrl || null,
      createdAt: now,
      updatedAt: now
    };
    this.socialLinks.set(id, link);
    return link;
  }

  async updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const link = this.socialLinks.get(id);
    if (!link) return undefined;
    
    const updatedLink = { 
      ...link, 
      ...data, 
      updatedAt: new Date() 
    };
    this.socialLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    return this.socialLinks.delete(id);
  }

  // KYC verifications methods
  async getKycVerification(userId: number): Promise<KycVerification | undefined> {
    return Array.from(this.kycVerifications.values()).find(
      (verification) => verification.userId === userId
    );
  }

  async createKycVerification(userId: number, verification: InsertKycVerification): Promise<KycVerification> {
    const id = this.currentId.kycVerifications++;
    const now = new Date();
    const kycVerification: KycVerification = {
      id,
      userId,
      status: verification.status || "pending",
      providerReference: verification.providerReference || null,
      verificationData: verification.verificationData || null,
      createdAt: now,
      updatedAt: now
    };
    this.kycVerifications.set(id, kycVerification);
    return kycVerification;
  }

  async updateKycVerification(id: number, data: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    const verification = this.kycVerifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification = { 
      ...verification, 
      ...data, 
      updatedAt: new Date() 
    };
    this.kycVerifications.set(id, updatedVerification);
    return updatedVerification;
  }

  // Esports profiles methods
  async getEsportsProfiles(userId: number): Promise<EsportsProfile[]> {
    return Array.from(this.esportsProfiles.values()).filter(
      (profile) => profile.userId === userId
    );
  }

  async createEsportsProfile(userId: number, profile: InsertEsportsProfile): Promise<EsportsProfile> {
    const id = this.currentId.esportsProfiles++;
    const now = new Date();
    const esportsProfile: EsportsProfile = {
      id,
      userId,
      platform: profile.platform,
      profileUrl: profile.profileUrl,
      username: profile.username || null,
      validationStatus: profile.validationStatus || "pending",
      validatedAt: profile.validatedAt || null,
      createdAt: now
    };
    this.esportsProfiles.set(id, esportsProfile);
    return esportsProfile;
  }

  async updateEsportsProfile(id: number, data: Partial<InsertEsportsProfile>): Promise<EsportsProfile | undefined> {
    const profile = this.esportsProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      ...data 
    };
    this.esportsProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteEsportsProfile(id: number): Promise<boolean> {
    return this.esportsProfiles.delete(id);
  }

  // Coin balance methods
  async getCoinBalance(userId: number): Promise<CoinBalance | undefined> {
    return this.coinBalances.get(userId);
  }

  async createCoinBalance(userId: number): Promise<CoinBalance> {
    const now = new Date();
    const coinBalance: CoinBalance = {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      updatedAt: now
    };
    this.coinBalances.set(userId, coinBalance);
    return coinBalance;
  }

  async updateCoinBalance(userId: number, amount: number): Promise<CoinBalance | undefined> {
    const balance = this.coinBalances.get(userId);
    if (!balance) return undefined;
    
    const now = new Date();
    const updatedBalance: CoinBalance = {
      ...balance,
      balance: balance.balance + amount,
      lifetimeEarned: amount > 0 ? balance.lifetimeEarned + amount : balance.lifetimeEarned,
      lifetimeSpent: amount < 0 ? balance.lifetimeSpent - amount : balance.lifetimeSpent,
      updatedAt: now
    };
    this.coinBalances.set(userId, updatedBalance);
    return updatedBalance;
  }

  // Coin transactions methods
  async getCoinTransactions(userId: number, limit?: number): Promise<CoinTransaction[]> {
    const transactions = Array.from(this.coinTransactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async createCoinTransaction(userId: number, transaction: InsertCoinTransaction): Promise<CoinTransaction> {
    const id = this.currentId.coinTransactions++;
    const now = new Date();
    const coinTransaction: CoinTransaction = {
      id,
      userId,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      description: transaction.description,
      relatedEntityType: transaction.relatedEntityType || null,
      relatedEntityId: transaction.relatedEntityId || null,
      createdAt: now
    };
    this.coinTransactions.set(id, coinTransaction);
    
    // Update balance
    const balance = await this.getCoinBalance(userId);
    if (balance) {
      await this.updateCoinBalance(userId, transaction.amount);
    } else {
      const newBalance = await this.createCoinBalance(userId);
      await this.updateCoinBalance(userId, transaction.amount);
    }
    
    return coinTransaction;
  }

  // Shop items methods
  async getShopItems(filters?: { isActive?: boolean }): Promise<ShopItem[]> {
    let items = Array.from(this.shopItems.values());
    
    if (filters?.isActive !== undefined) {
      items = items.filter(item => item.isActive === filters.isActive);
    }
    
    return items;
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const id = this.currentId.shopItems++;
    const now = new Date();
    const shopItem: ShopItem = {
      id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl || null,
      coinPrice: item.coinPrice,
      type: item.type,
      stock: item.stock || null,
      isActive: item.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.shopItems.set(id, shopItem);
    return shopItem;
  }

  async updateShopItem(id: number, data: Partial<InsertShopItem>): Promise<ShopItem | undefined> {
    const item = this.shopItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { 
      ...item, 
      ...data, 
      updatedAt: new Date() 
    };
    this.shopItems.set(id, updatedItem);
    return updatedItem;
  }

  // Redemption orders methods
  async getRedemptionOrders(userId: number): Promise<RedemptionOrder[]> {
    return Array.from(this.redemptionOrders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRedemptionOrder(id: number): Promise<RedemptionOrder | undefined> {
    return this.redemptionOrders.get(id);
  }

  async createRedemptionOrder(userId: number, order: InsertRedemptionOrder): Promise<RedemptionOrder> {
    const id = this.currentId.redemptionOrders++;
    const now = new Date();
    const redemptionOrder: RedemptionOrder = {
      id,
      userId,
      shopItemId: order.shopItemId,
      quantity: order.quantity || 1,
      coinCost: order.coinCost,
      status: order.status || "pending",
      shippingData: order.shippingData || null,
      fulfillmentData: order.fulfillmentData || null,
      createdAt: now,
      updatedAt: now
    };
    this.redemptionOrders.set(id, redemptionOrder);
    
    // Update item stock if applicable
    const item = await this.getShopItem(order.shopItemId);
    if (item && item.stock !== null) {
      await this.updateShopItem(item.id, {
        stock: item.stock - (order.quantity || 1)
      });
    }
    
    return redemptionOrder;
  }

  async updateRedemptionOrder(id: number, data: Partial<InsertRedemptionOrder>): Promise<RedemptionOrder | undefined> {
    const order = this.redemptionOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      ...data, 
      updatedAt: new Date() 
    };
    this.redemptionOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  // News content methods
  async getNewsContent(filters?: { isPublished?: boolean, category?: string, limit?: number }): Promise<NewsContent[]> {
    let news = Array.from(this.newsContents.values())
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
    
    if (filters?.isPublished !== undefined) {
      news = news.filter(item => item.isPublished === filters.isPublished);
    }
    
    if (filters?.category) {
      news = news.filter(item => item.category === filters.category);
    }
    
    return filters?.limit ? news.slice(0, filters.limit) : news;
  }

  async getNewsContentBySlug(slug: string): Promise<NewsContent | undefined> {
    return Array.from(this.newsContents.values()).find(
      (content) => content.slug === slug
    );
  }

  async getNewsContentById(id: number): Promise<NewsContent | undefined> {
    return this.newsContents.get(id);
  }

  async createNewsContent(content: InsertNewsContent): Promise<NewsContent> {
    const id = this.currentId.newsContents++;
    const now = new Date();
    const newsContent: NewsContent = {
      id,
      title: content.title,
      slug: content.slug,
      content: content.content,
      excerpt: content.excerpt || null,
      imageUrl: content.imageUrl || null,
      category: content.category,
      authorId: content.authorId || null,
      publishDate: content.publishDate,
      isPublished: content.isPublished ?? false,
      updatedAt: now
    };
    this.newsContents.set(id, newsContent);
    return newsContent;
  }

  async updateNewsContent(id: number, data: Partial<InsertNewsContent>): Promise<NewsContent | undefined> {
    const content = this.newsContents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { 
      ...content, 
      ...data, 
      updatedAt: new Date() 
    };
    this.newsContents.set(id, updatedContent);
    return updatedContent;
  }

  // Matches methods
  async getMatches(filters?: { status?: string, game?: string, limit?: number }): Promise<Match[]> {
    let matches = Array.from(this.matches.values());
    
    if (filters?.status) {
      matches = matches.filter(match => match.status === filters.status);
    }
    
    if (filters?.game) {
      matches = matches.filter(match => match.game === filters.game);
    }
    
    // Sort by scheduled date
    matches.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    
    return filters?.limit ? matches.slice(0, filters.limit) : matches;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentId.matches++;
    const now = new Date();
    const newMatch: Match = {
      id,
      game: match.game,
      tournamentName: match.tournamentName,
      teamOneName: match.teamOneName,
      teamOneLogoUrl: match.teamOneLogoUrl || null,
      teamOneCountry: match.teamOneCountry || null,
      teamTwoName: match.teamTwoName,
      teamTwoLogoUrl: match.teamTwoLogoUrl || null,
      teamTwoCountry: match.teamTwoCountry || null,
      scheduledDate: match.scheduledDate,
      result: match.result || null,
      status: match.status || "upcoming",
      streamUrl: match.streamUrl || null,
      createdAt: now,
      updatedAt: now
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { 
      ...match, 
      ...data, 
      updatedAt: new Date() 
    };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Streams methods
  async getStreams(filters?: { status?: string, limit?: number }): Promise<Stream[]> {
    let streams = Array.from(this.streams.values());
    
    if (filters?.status) {
      streams = streams.filter(stream => stream.status === filters.status);
    }
    
    // Sort by viewer count (desc)
    streams.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
    
    return filters?.limit ? streams.slice(0, filters.limit) : streams;
  }

  async getStream(id: number): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async createStream(stream: InsertStream): Promise<Stream> {
    const id = this.currentId.streams++;
    const now = new Date();
    const newStream: Stream = {
      id,
      platform: stream.platform,
      channelId: stream.channelId,
      streamUrl: stream.streamUrl,
      title: stream.title || null,
      thumbnailUrl: stream.thumbnailUrl || null,
      game: stream.game || null,
      streamerName: stream.streamerName || null,
      streamerAvatarUrl: stream.streamerAvatarUrl || null,
      status: stream.status || "offline",
      viewerCount: stream.viewerCount || null,
      lastCheckedAt: stream.lastCheckedAt || now,
      createdAt: now
    };
    this.streams.set(id, newStream);
    return newStream;
  }

  async updateStream(id: number, data: Partial<InsertStream>): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;
    
    const updatedStream = { 
      ...stream, 
      ...data 
    };
    this.streams.set(id, updatedStream);
    return updatedStream;
  }

  // Surveys methods
  async getSurveys(filters?: { status?: string, userId?: number, responded?: boolean }): Promise<Survey[]> {
    let surveys = Array.from(this.surveys.values());
    
    if (filters?.status) {
      surveys = surveys.filter(survey => survey.status === filters.status);
    }
    
    if (filters?.userId !== undefined && filters?.responded !== undefined) {
      // Get all response IDs for the user
      const userResponses = Array.from(this.surveyResponses.values())
        .filter(response => response.userId === filters.userId)
        .map(response => response.surveyId);
      
      if (filters.responded) {
        // Return only surveys the user has responded to
        surveys = surveys.filter(survey => userResponses.includes(survey.id));
      } else {
        // Return only surveys the user has not responded to
        surveys = surveys.filter(survey => !userResponses.includes(survey.id));
      }
    }
    
    return surveys;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const id = this.currentId.surveys++;
    const now = new Date();
    const newSurvey: Survey = {
      id,
      title: survey.title,
      description: survey.description,
      reward: survey.reward,
      expirationDate: survey.expirationDate || null,
      status: survey.status || "draft",
      estimatedTimeMinutes: survey.estimatedTimeMinutes || null,
      createdAt: now,
      updatedAt: now
    };
    this.surveys.set(id, newSurvey);
    return newSurvey;
  }

  async updateSurvey(id: number, data: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;
    
    const updatedSurvey = { 
      ...survey, 
      ...data, 
      updatedAt: new Date() 
    };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  // Survey questions methods
  async getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
    return Array.from(this.surveyQuestions.values())
      .filter(question => question.surveyId === surveyId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const id = this.currentId.surveyQuestions++;
    const newQuestion: SurveyQuestion = {
      id,
      surveyId: question.surveyId,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || null,
      isRequired: question.isRequired ?? true,
      orderIndex: question.orderIndex
    };
    this.surveyQuestions.set(id, newQuestion);
    return newQuestion;
  }

  // Survey responses methods
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    return Array.from(this.surveyResponses.values())
      .filter(response => response.surveyId === surveyId);
  }

  async getUserSurveyResponses(userId: number): Promise<SurveyResponse[]> {
    return Array.from(this.surveyResponses.values())
      .filter(response => response.userId === userId);
  }

  async getSurveyResponseById(id: number): Promise<SurveyResponse | undefined> {
    return this.surveyResponses.get(id);
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const id = this.currentId.surveyResponses++;
    const now = new Date();
    const newResponse: SurveyResponse = {
      id,
      surveyId: response.surveyId,
      userId: response.userId,
      responses: response.responses,
      completedAt: now,
      rewardIssued: response.rewardIssued ?? false
    };
    this.surveyResponses.set(id, newResponse);
    
    // If reward not yet issued, issue it now
    if (!newResponse.rewardIssued) {
      const survey = await this.getSurvey(response.surveyId);
      if (survey) {
        // Add coins to user's balance
        await this.createCoinTransaction(response.userId, {
          amount: survey.reward,
          transactionType: "survey_reward",
          description: `Recompensa pela conclusão da pesquisa: ${survey.title}`,
          relatedEntityType: "survey",
          relatedEntityId: survey.id
        });
        
        // Mark reward as issued
        await this.updateSurveyResponse(id, { rewardIssued: true });
      }
    }
    
    return newResponse;
  }

  async updateSurveyResponse(id: number, data: Partial<InsertSurveyResponse>): Promise<SurveyResponse | undefined> {
    const response = this.surveyResponses.get(id);
    if (!response) return undefined;
    
    const updatedResponse = { 
      ...response, 
      ...data 
    };
    this.surveyResponses.set(id, updatedResponse);
    return updatedResponse;
  }

  async hasUserRespondedToSurvey(userId: number, surveyId: number): Promise<boolean> {
    return Array.from(this.surveyResponses.values()).some(
      response => response.userId === userId && response.surveyId === surveyId
    );
  }
}

import { DatabaseStorage } from './database-storage';

// exportar a implementação de banco de dados PostgreSQL em vez da memória
export const storage = new DatabaseStorage();
