import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tipos personalizados
export type AdminRole = "super_admin" | "admin" | "editor" | "viewer";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().defaultRandom(),
  primaryIdentity: text("primary_identity").notNull().unique(),
  identityType: text("identity_type").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("pending_verification"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Necessário definir as tabelas antes de usar as relações
// As relações serão definidas após todas as tabelas estarem declaradas

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthDate: date("birth_date"),
  cpfEncrypted: text("cpf_encrypted"),
  addressStreet: text("address_street"),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  addressNeighborhood: text("address_neighborhood"),
  addressCity: text("address_city"),
  addressState: text("address_state"),
  addressZipCode: text("address_zip_code"),
  interests: jsonb("interests"),
  activitiesEvents: text("activities_events"),
  avatarUrl: text("avatar_url"),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  marketingConsent: boolean("marketing_consent").default(false),
  theme: text("theme").default("dark"),
  language: text("language").default("pt-BR"),
});

// Social links table
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  platformUserId: text("platform_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  username: text("username"),
  profileUrl: text("profile_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// KYC verifications table
export const kycVerifications = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"),
  providerReference: text("provider_reference"),
  verificationData: jsonb("verification_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// E-sports profile links table
export const esportsProfileLinks = pgTable("esports_profile_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  profileUrl: text("profile_url").notNull(),
  username: text("username"),
  validationStatus: text("validation_status").default("pending"),
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Coin balances table
export const coinBalances = pgTable("coin_balances", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  balance: integer("balance").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  lifetimeSpent: integer("lifetime_spent").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Coin transactions table
export const coinTransactions = pgTable("coin_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  transactionType: text("transaction_type").notNull(),
  description: text("description").notNull(),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shop items table
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  coinPrice: integer("coin_price").notNull(),
  type: text("type").notNull(),
  stock: integer("stock"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Redemption orders table
export const redemptionOrders = pgTable("redemption_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  shopItemId: integer("shop_item_id").references(() => shopItems.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  coinCost: integer("coin_cost").notNull(),
  status: text("status").notNull().default("pending"),
  shippingData: jsonb("shipping_data"),
  fulfillmentData: jsonb("fulfillment_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// News/content table
export const newsContent = pgTable("news_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  authorId: integer("author_id").references(() => users.id),
  publishDate: timestamp("publish_date").notNull(),
  isPublished: boolean("is_published").default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Match schedule table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  game: text("game").notNull(),
  tournamentName: text("tournament_name").notNull(),
  teamOneName: text("team_one_name").notNull(),
  teamOneLogoUrl: text("team_one_logo_url"),
  teamOneCountry: text("team_one_country"),
  teamTwoName: text("team_two_name").notNull(),
  teamTwoLogoUrl: text("team_two_logo_url"),
  teamTwoCountry: text("team_two_country"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  result: text("result"),
  status: text("status").notNull().default("upcoming"),
  streamUrl: text("stream_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Streams table
export const streams = pgTable("streams", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  channelId: text("channel_id").notNull(),
  streamUrl: text("stream_url").notNull(),
  title: text("title"),
  thumbnailUrl: text("thumbnail_url"),
  game: text("game"),
  streamerName: text("streamer_name"),
  streamerAvatarUrl: text("streamer_avatar_url"),
  status: text("status").notNull().default("offline"),
  viewerCount: integer("viewer_count"),
  lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("viewer"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Surveys table
export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  expirationDate: timestamp("expiration_date"),
  status: text("status").notNull().default("draft"),
  estimatedTimeMinutes: integer("estimated_time_minutes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Survey questions table
export const surveyQuestions = pgTable("survey_questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").references(() => surveys.id).notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  options: jsonb("options"),
  isRequired: boolean("is_required").default(true),
  orderIndex: integer("order_index").notNull(),
});

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").references(() => surveys.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  rewardIssued: boolean("reward_issued").default(false),
});

// Create schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  publicId: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  userId: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  userId: true,
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEsportsProfileSchema = createInsertSchema(esportsProfileLinks).omit({
  id: true,
  createdAt: true,
});

export const insertCoinTransactionSchema = createInsertSchema(coinTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRedemptionOrderSchema = createInsertSchema(redemptionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsContentSchema = createInsertSchema(newsContent).omit({
  id: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreamSchema = createInsertSchema(streams).omit({
  id: true,
  createdAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyQuestionSchema = createInsertSchema(surveyQuestions).omit({
  id: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  completedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  passwordHash: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

// Auth schemas
export const registerSchema = z.object({
  primaryIdentity: z.string().min(3),
  identityType: z.enum(["email", "phone"]),
  password: z.string().min(8),
  birthDate: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de uso e política de privacidade."
  })
});

export const loginSchema = z.object({
  primaryIdentity: z.string(),
  password: z.string(),
  rememberMe: z.boolean().optional()
});

export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().optional()
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;
export type EsportsProfile = typeof esportsProfileLinks.$inferSelect;
export type InsertEsportsProfile = z.infer<typeof insertEsportsProfileSchema>;
export type CoinBalance = typeof coinBalances.$inferSelect;
export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = z.infer<typeof insertCoinTransactionSchema>;
export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type RedemptionOrder = typeof redemptionOrders.$inferSelect;
export type InsertRedemptionOrder = z.infer<typeof insertRedemptionOrderSchema>;
export type NewsContent = typeof newsContent.$inferSelect;
export type InsertNewsContent = z.infer<typeof insertNewsContentSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Stream = typeof streams.$inferSelect;
export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type InsertSurveyQuestion = z.infer<typeof insertSurveyQuestionSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Definição das relações
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  preferences: one(userPreferences),
  coinBalance: one(coinBalances),
  socialLinks: many(socialLinks),
  kycVerification: one(kycVerifications),
  esportsProfiles: many(esportsProfileLinks),
  coinTransactions: many(coinTransactions),
  redemptionOrders: many(redemptionOrders),
  authoredContent: many(newsContent, { relationName: "author" }),
  surveyResponses: many(surveyResponses),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  user: one(users, {
    fields: [socialLinks.userId],
    references: [users.id]
  })
}));

export const kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id]
  })
}));

export const esportsProfileLinksRelations = relations(esportsProfileLinks, ({ one }) => ({
  user: one(users, {
    fields: [esportsProfileLinks.userId],
    references: [users.id]
  })
}));

export const coinBalancesRelations = relations(coinBalances, ({ one }) => ({
  user: one(users, {
    fields: [coinBalances.userId],
    references: [users.id]
  })
}));

export const coinTransactionsRelations = relations(coinTransactions, ({ one }) => ({
  user: one(users, {
    fields: [coinTransactions.userId],
    references: [users.id]
  })
}));

export const redemptionOrdersRelations = relations(redemptionOrders, ({ one }) => ({
  user: one(users, {
    fields: [redemptionOrders.userId],
    references: [users.id]
  }),
  shopItem: one(shopItems, {
    fields: [redemptionOrders.shopItemId],
    references: [shopItems.id]
  })
}));

export const newsContentRelations = relations(newsContent, ({ one }) => ({
  author: one(users, {
    fields: [newsContent.authorId],
    references: [users.id]
  })
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  user: one(users, {
    fields: [surveyResponses.userId],
    references: [users.id]
  }),
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id]
  })
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyQuestions.surveyId],
    references: [surveys.id]
  })
}));

export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  redemptionOrders: many(redemptionOrders)
}));

export const surveysRelations = relations(surveys, ({ many }) => ({
  questions: many(surveyQuestions),
  responses: many(surveyResponses)
}));
