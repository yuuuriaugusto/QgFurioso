import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { pool } from './db';
import {
  users, userProfiles, userPreferences, socialLinks, kycVerifications,
  esportsProfileLinks, coinBalances, coinTransactions, shopItems,
  redemptionOrders, newsContent, matches, streams, surveys,
  surveyQuestions, surveyResponses,
  type User, type InsertUser, type UserProfile, type InsertUserProfile,
  type UserPreferences, type InsertUserPreferences, type SocialLink,
  type InsertSocialLink, type KycVerification, type InsertKycVerification,
  type EsportsProfile, type InsertEsportsProfile, type CoinBalance,
  type CoinTransaction, type InsertCoinTransaction, type ShopItem,
  type InsertShopItem, type RedemptionOrder, type InsertRedemptionOrder,
  type NewsContent, type InsertNewsContent, type Match, type InsertMatch,
  type Stream, type InsertStream, type Survey, type InsertSurvey,
  type SurveyQuestion, type InsertSurveyQuestion, type SurveyResponse, 
  type InsertSurveyResponse
} from '@shared/schema';
import { IStorage } from './storage';

const PostgresSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPrimaryIdentity(primaryIdentity: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.primaryIdentity, primaryIdentity));
    return user;
  }

  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      passwordHash: userData.passwordHash
    }).returning();
    
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // User profiles
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    
    return profile;
  }

  async createUserProfile(userId: number, profile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db
      .insert(userProfiles)
      .values({
        userId,
        ...profile
      })
      .returning();
    
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }
  
  // User preferences
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    
    return preferences;
  }

  async createUserPreferences(userId: number, preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [userPreferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...preferences
      })
      .returning();
    
    return userPreferences;
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set(preferences)
      .where(eq(userPreferences.userId, userId))
      .returning();
    
    return updatedPreferences;
  }
  
  // Social links
  async getSocialLinks(userId: number): Promise<SocialLink[]> {
    const links = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.userId, userId));
    
    return links;
  }

  async getSocialLinkByPlatform(userId: number, platform: string): Promise<SocialLink | undefined> {
    const [link] = await db
      .select()
      .from(socialLinks)
      .where(and(
        eq(socialLinks.userId, userId),
        eq(socialLinks.platform, platform)
      ));
    
    return link;
  }

  async createSocialLink(userId: number, socialLink: InsertSocialLink): Promise<SocialLink> {
    const [link] = await db
      .insert(socialLinks)
      .values({
        ...socialLink,
        userId
      })
      .returning();
    
    return link;
  }

  async updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const [updatedLink] = await db
      .update(socialLinks)
      .set(data)
      .where(eq(socialLinks.id, id))
      .returning();
    
    return updatedLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    await db
      .delete(socialLinks)
      .where(eq(socialLinks.id, id));
    
    return true;
  }
  
  // KYC verifications
  async getKycVerification(userId: number): Promise<KycVerification | undefined> {
    const [verification] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId));
    
    return verification;
  }

  async createKycVerification(userId: number, verification: InsertKycVerification): Promise<KycVerification> {
    const [kycVerification] = await db
      .insert(kycVerifications)
      .values({
        ...verification,
        userId
      })
      .returning();
    
    return kycVerification;
  }

  async updateKycVerification(id: number, data: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    const [updatedVerification] = await db
      .update(kycVerifications)
      .set(data)
      .where(eq(kycVerifications.id, id))
      .returning();
    
    return updatedVerification;
  }
  
  // Esports profiles
  async getEsportsProfiles(userId: number): Promise<EsportsProfile[]> {
    const profiles = await db
      .select()
      .from(esportsProfileLinks)
      .where(eq(esportsProfileLinks.userId, userId));
    
    return profiles;
  }

  async createEsportsProfile(userId: number, profile: InsertEsportsProfile): Promise<EsportsProfile> {
    const [esportsProfile] = await db
      .insert(esportsProfileLinks)
      .values({
        ...profile,
        userId
      })
      .returning();
    
    return esportsProfile;
  }

  async updateEsportsProfile(id: number, data: Partial<InsertEsportsProfile>): Promise<EsportsProfile | undefined> {
    const [updatedProfile] = await db
      .update(esportsProfileLinks)
      .set(data)
      .where(eq(esportsProfileLinks.id, id))
      .returning();
    
    return updatedProfile;
  }

  async deleteEsportsProfile(id: number): Promise<boolean> {
    await db
      .delete(esportsProfileLinks)
      .where(eq(esportsProfileLinks.id, id));
    
    return true;
  }
  
  // Coin management
  async getCoinBalance(userId: number): Promise<CoinBalance | undefined> {
    const [balance] = await db
      .select()
      .from(coinBalances)
      .where(eq(coinBalances.userId, userId));
    
    return balance;
  }

  async createCoinBalance(userId: number): Promise<CoinBalance> {
    const [coinBalance] = await db
      .insert(coinBalances)
      .values({
        userId,
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0
      })
      .returning();
    
    return coinBalance;
  }

  async updateCoinBalance(userId: number, amount: number): Promise<CoinBalance | undefined> {
    const [updatedBalance] = await db
      .update(coinBalances)
      .set({
        balance: amount,
        updatedAt: new Date()
      })
      .where(eq(coinBalances.userId, userId))
      .returning();
    
    return updatedBalance;
  }

  async getCoinTransactions(userId: number, limit?: number): Promise<CoinTransaction[]> {
    let query = db
      .select()
      .from(coinTransactions)
      .where(eq(coinTransactions.userId, userId))
      .orderBy(desc(coinTransactions.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const transactions = await query;
    return transactions;
  }

  async createCoinTransaction(userId: number, transaction: InsertCoinTransaction): Promise<CoinTransaction> {
    // Create the transaction
    const [coinTransaction] = await db
      .insert(coinTransactions)
      .values({
        ...transaction,
        userId
      })
      .returning();
    
    // Get the current balance
    let balance = await this.getCoinBalance(userId);
    if (!balance) {
      // Create balance if it doesn't exist
      balance = await this.createCoinBalance(userId);
    }

    // Update lifetime metrics
    const updateData: Partial<CoinBalance> = {
      balance: balance.balance + transaction.amount,
      updatedAt: new Date()
    };
    
    if (transaction.amount > 0) {
      updateData.lifetimeEarned = balance.lifetimeEarned + transaction.amount;
    } else {
      updateData.lifetimeSpent = balance.lifetimeSpent + Math.abs(transaction.amount);
    }
    
    // Update the balance
    await db
      .update(coinBalances)
      .set(updateData)
      .where(eq(coinBalances.userId, userId));
    
    return coinTransaction;
  }
  
  // Shop items
  async getShopItems(filters?: { isActive?: boolean }): Promise<ShopItem[]> {
    let query = db.select().from(shopItems);
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(shopItems.isActive, filters.isActive));
    }
    
    return await query;
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    const [item] = await db
      .select()
      .from(shopItems)
      .where(eq(shopItems.id, id));
    
    return item;
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const [shopItem] = await db
      .insert(shopItems)
      .values(item)
      .returning();
    
    return shopItem;
  }

  async updateShopItem(id: number, data: Partial<InsertShopItem>): Promise<ShopItem | undefined> {
    const [updatedItem] = await db
      .update(shopItems)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(shopItems.id, id))
      .returning();
    
    return updatedItem;
  }
  
  // Redemptions
  async getRedemptionOrders(userId: number): Promise<RedemptionOrder[]> {
    const orders = await db
      .select()
      .from(redemptionOrders)
      .where(eq(redemptionOrders.userId, userId))
      .orderBy(desc(redemptionOrders.createdAt));
    
    return orders;
  }

  async getRedemptionOrder(id: number): Promise<RedemptionOrder | undefined> {
    const [order] = await db
      .select()
      .from(redemptionOrders)
      .where(eq(redemptionOrders.id, id));
    
    return order;
  }

  async createRedemptionOrder(userId: number, order: InsertRedemptionOrder): Promise<RedemptionOrder> {
    const [redemptionOrder] = await db
      .insert(redemptionOrders)
      .values({
        ...order,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return redemptionOrder;
  }

  async updateRedemptionOrder(id: number, data: Partial<InsertRedemptionOrder>): Promise<RedemptionOrder | undefined> {
    const [updatedOrder] = await db
      .update(redemptionOrders)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(redemptionOrders.id, id))
      .returning();
    
    return updatedOrder;
  }
  
  // News content
  async getNewsContent(filters?: { isPublished?: boolean, category?: string, limit?: number }): Promise<NewsContent[]> {
    let query = db.select().from(newsContent);
    
    if (filters?.isPublished !== undefined) {
      query = query.where(eq(newsContent.isPublished, filters.isPublished));
    }
    
    if (filters?.category) {
      query = query.where(eq(newsContent.category, filters.category));
    }
    
    query = query.orderBy(desc(newsContent.publishDate));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getNewsContentBySlug(slug: string): Promise<NewsContent | undefined> {
    const [content] = await db
      .select()
      .from(newsContent)
      .where(eq(newsContent.slug, slug));
    
    return content;
  }

  async getNewsContentById(id: number): Promise<NewsContent | undefined> {
    const [content] = await db
      .select()
      .from(newsContent)
      .where(eq(newsContent.id, id));
    
    return content;
  }

  async createNewsContent(content: InsertNewsContent): Promise<NewsContent> {
    const [newsItem] = await db
      .insert(newsContent)
      .values({
        ...content,
        updatedAt: new Date()
      })
      .returning();
    
    return newsItem;
  }

  async updateNewsContent(id: number, data: Partial<InsertNewsContent>): Promise<NewsContent | undefined> {
    const [updatedContent] = await db
      .update(newsContent)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(newsContent.id, id))
      .returning();
    
    return updatedContent;
  }
  
  // Matches
  async getMatches(filters?: { status?: string, game?: string, limit?: number }): Promise<Match[]> {
    let query = db.select().from(matches);
    
    if (filters?.status) {
      query = query.where(eq(matches.status, filters.status));
    }
    
    if (filters?.game) {
      query = query.where(eq(matches.game, filters.game));
    }
    
    query = query.orderBy(desc(matches.scheduledDate));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id));
    
    return match;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values({
        ...match,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newMatch;
  }

  async updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match | undefined> {
    const [updatedMatch] = await db
      .update(matches)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(matches.id, id))
      .returning();
    
    return updatedMatch;
  }
  
  // Streams
  async getStreams(filters?: { status?: string, limit?: number }): Promise<Stream[]> {
    let query = db.select().from(streams);
    
    if (filters?.status) {
      query = query.where(eq(streams.status, filters.status));
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async getStream(id: number): Promise<Stream | undefined> {
    const [stream] = await db
      .select()
      .from(streams)
      .where(eq(streams.id, id));
    
    return stream;
  }

  async createStream(stream: InsertStream): Promise<Stream> {
    const [newStream] = await db
      .insert(streams)
      .values({
        ...stream,
        createdAt: new Date()
      })
      .returning();
    
    return newStream;
  }

  async updateStream(id: number, data: Partial<InsertStream>): Promise<Stream | undefined> {
    const [updatedStream] = await db
      .update(streams)
      .set({
        ...data,
        lastCheckedAt: new Date()
      })
      .where(eq(streams.id, id))
      .returning();
    
    return updatedStream;
  }
  
  // Surveys
  async getSurveys(filters?: { status?: string, userId?: number, responded?: boolean }): Promise<Survey[]> {
    let query = db.select().from(surveys);
    
    if (filters?.status) {
      query = query.where(eq(surveys.status, filters.status));
    }
    
    const result = await query;
    
    // Filter by user response status if needed
    if (filters?.userId !== undefined && filters?.responded !== undefined) {
      const userResponses = await this.getUserSurveyResponses(filters.userId);
      const respondedSurveyIds = userResponses.map(r => r.surveyId);
      
      return result.filter(survey => {
        const hasResponded = respondedSurveyIds.includes(survey.id);
        return filters.responded ? hasResponded : !hasResponded;
      });
    }
    
    return result;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, id));
    
    return survey;
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const [newSurvey] = await db
      .insert(surveys)
      .values({
        ...survey,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newSurvey;
  }

  async updateSurvey(id: number, data: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const [updatedSurvey] = await db
      .update(surveys)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(surveys.id, id))
      .returning();
    
    return updatedSurvey;
  }
  
  // Survey questions
  async getSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
    const questions = await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.surveyId, surveyId))
      .orderBy(surveyQuestions.orderIndex);
    
    return questions;
  }

  async createSurveyQuestion(question: InsertSurveyQuestion): Promise<SurveyQuestion> {
    const [newQuestion] = await db
      .insert(surveyQuestions)
      .values(question)
      .returning();
    
    return newQuestion;
  }
  
  // Survey responses
  async getSurveyResponses(surveyId: number): Promise<SurveyResponse[]> {
    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId));
    
    return responses;
  }

  async getUserSurveyResponses(userId: number): Promise<SurveyResponse[]> {
    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.userId, userId));
    
    return responses;
  }

  async getSurveyResponseById(id: number): Promise<SurveyResponse | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.id, id));
    
    return response;
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [newResponse] = await db
      .insert(surveyResponses)
      .values({
        ...response,
        completedAt: new Date(),
        rewardIssued: false
      })
      .returning();
    
    return newResponse;
  }

  async updateSurveyResponse(id: number, data: Partial<InsertSurveyResponse>): Promise<SurveyResponse | undefined> {
    const [updatedResponse] = await db
      .update(surveyResponses)
      .set(data)
      .where(eq(surveyResponses.id, id))
      .returning();
    
    return updatedResponse;
  }

  async hasUserRespondedToSurvey(userId: number, surveyId: number): Promise<boolean> {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(surveyResponses)
      .where(and(
        eq(surveyResponses.userId, userId),
        eq(surveyResponses.surveyId, surveyId)
      ));
    
    return count[0].count > 0;
  }
}

export const storage = new DatabaseStorage();