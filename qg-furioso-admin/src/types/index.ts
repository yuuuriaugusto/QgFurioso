// Tipos básicos da aplicação

// Autenticação e usuários
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export type AdminRole = 'super_admin' | 'content_manager' | 'support' | 'shop_manager' | 'viewer';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  publicId: string;
  primaryIdentity: string;
  identityType: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  coinBalance?: CoinBalance;
}

export interface UserProfile {
  userId: number;
  displayName: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  birthDate: Date | null;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycVerification {
  id: number;
  userId: number;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt: Date | null;
  rejectionReason: string | null;
}

export interface SocialLink {
  id: number;
  userId: number;
  platform: string;
  username: string;
  profileUrl: string;
  isVerified: boolean;
  addedAt: Date;
}

export interface EsportsProfile {
  id: number;
  userId: number;
  platform: string;
  username: string;
  profileUrl: string;
  isVerified: boolean;
  primaryGame: string;
  addedAt: Date;
}

// Sistema de moedas e loja
export interface CoinBalance {
  userId: number;
  amount: number;
  updatedAt: Date;
}

export interface CoinTransaction {
  id: number;
  userId: number;
  amount: number;
  transactionType: string;
  description: string;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  createdAt: Date;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  coinPrice: number;
  type: string;
  stock: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedemptionOrder {
  id: number;
  userId: number;
  shopItemId: number;
  quantity: number;
  coinsCost: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  shippingInfo: string | null;
  trackingCode: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Conteúdo
export interface NewsContent {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  authorId: number;
  category: string;
  imageUrl: string | null;
  isPublished: boolean;
  publishDate: Date | null;
  readTime: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  coinReward: number;
  status: 'draft' | 'active' | 'closed';
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyQuestion {
  id: number;
  surveyId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'text' | 'scale';
  options: string[] | null;
  isRequired: boolean;
  orderIndex: number;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  userId: number;
  answers: { [key: string]: string | number | string[] };
  completedAt: Date;
  rewardIssued: boolean;
}

// Métricas e logs
export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  newRegistrations: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  totalCoins: {
    inCirculation: number;
    earned: number;
    spent: number;
  };
  pendingRedemptions: number;
  kycStats: {
    verified: number;
    pending: number;
    notStarted: number;
    rejected: number;
  };
  activeSurveys: number;
  surveyResponseRate: number;
}

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

// Filtros e Paginação
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  order: 'ascend' | 'descend';
}