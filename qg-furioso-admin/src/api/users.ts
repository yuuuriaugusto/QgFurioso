import { User, KycVerification, SocialLink, EsportsProfile, CoinTransaction, PaginationParams, SortParams } from '@types';
import { get, post, put } from './api';

/**
 * Busca lista de usuários com filtros e paginação
 */
export async function fetchUsers(
  filters: {
    status?: string;
    kycStatus?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: User[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.kycStatus) queryParams.append('kycStatus', filters.kycStatus);
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: User[]; total: number }>(`/api/admin/users?${queryParams.toString()}`);
}

/**
 * Busca detalhes de um usuário específico
 */
export async function fetchUserDetails(userId: number): Promise<User> {
  return await get<User>(`/api/admin/users/${userId}`);
}

/**
 * Busca informações KYC de um usuário
 */
export async function fetchUserKycInfo(userId: number): Promise<KycVerification> {
  return await get<KycVerification>(`/api/admin/users/${userId}/kyc`);
}

/**
 * Busca links sociais de um usuário
 */
export async function fetchUserSocialLinks(userId: number): Promise<SocialLink[]> {
  return await get<SocialLink[]>(`/api/admin/users/${userId}/social-links`);
}

/**
 * Busca perfis de esports de um usuário
 */
export async function fetchUserEsportsProfiles(userId: number): Promise<EsportsProfile[]> {
  return await get<EsportsProfile[]>(`/api/admin/users/${userId}/esports-profiles`);
}

/**
 * Busca transações de moedas de um usuário
 */
export async function fetchUserCoinTransactions(
  userId: number,
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<{ data: CoinTransaction[]; total: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  return await get<{ data: CoinTransaction[]; total: number }>(`/api/admin/users/${userId}/coin-transactions?${queryParams.toString()}`);
}

/**
 * Atualiza o status de um usuário
 */
export async function updateUserStatus(userId: number, status: string): Promise<User> {
  return await put<User>(`/api/admin/users/${userId}/status`, { status });
}

/**
 * Adiciona ou remove moedas de um usuário
 */
export async function adjustUserCoins(userId: number, amount: number, reason: string): Promise<{ success: boolean; newBalance: number }> {
  return await post<{ success: boolean; newBalance: number }>(`/api/admin/users/${userId}/coins`, { amount, reason });
}

/**
 * Envia link de recuperação de senha para um usuário
 */
export async function sendPasswordReset(userId: number): Promise<{ success: boolean }> {
  return await post<{ success: boolean }>(`/api/admin/users/${userId}/reset-password`);
}