import { ShopItem, RedemptionOrder, PaginationParams, SortParams } from '@types';
import { get, post, put, del } from './api';

/**
 * Busca lista de itens da loja com filtros e paginação
 */
export async function fetchShopItems(
  filters: {
    isActive?: boolean;
    type?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: ShopItem[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: ShopItem[]; total: number }>(`/api/admin/shop/items?${queryParams.toString()}`);
}

/**
 * Busca detalhes de um item da loja específico
 */
export async function fetchShopItem(itemId: number): Promise<ShopItem> {
  return await get<ShopItem>(`/api/admin/shop/items/${itemId}`);
}

/**
 * Cria um novo item da loja
 */
export async function createShopItem(item: Omit<ShopItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShopItem> {
  return await post<ShopItem>('/api/admin/shop/items', item);
}

/**
 * Atualiza um item da loja existente
 */
export async function updateShopItem(
  itemId: number, 
  item: Partial<Omit<ShopItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ShopItem> {
  return await put<ShopItem>(`/api/admin/shop/items/${itemId}`, item);
}

/**
 * Altera o status de um item da loja (ativo/inativo)
 */
export async function toggleShopItemStatus(itemId: number, isActive: boolean): Promise<ShopItem> {
  return await put<ShopItem>(`/api/admin/shop/items/${itemId}/status`, { isActive });
}

/**
 * Remove um item da loja
 */
export async function deleteShopItem(itemId: number): Promise<void> {
  await del(`/api/admin/shop/items/${itemId}`);
}

/**
 * Busca lista de pedidos de resgate com filtros e paginação
 */
export async function fetchRedemptionOrders(
  filters: {
    status?: string;
    userId?: number;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: RedemptionOrder[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.userId) queryParams.append('userId', filters.userId.toString());
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: RedemptionOrder[]; total: number }>(`/api/admin/redemptions?${queryParams.toString()}`);
}

/**
 * Busca detalhes de um pedido de resgate específico
 */
export async function fetchRedemptionOrder(orderId: number): Promise<RedemptionOrder> {
  return await get<RedemptionOrder>(`/api/admin/redemptions/${orderId}`);
}

/**
 * Atualiza o status de um pedido de resgate
 */
export async function updateRedemptionStatus(
  orderId: number, 
  status: string, 
  details?: { trackingCode?: string; notes?: string }
): Promise<RedemptionOrder> {
  return await put<RedemptionOrder>(`/api/admin/redemptions/${orderId}/status`, { 
    status,
    ...details
  });
}

/**
 * Busca configurações de regras de coins
 */
export async function fetchCoinRules(): Promise<Record<string, number>> {
  return await get<Record<string, number>>('/api/admin/coin-rules');
}

/**
 * Atualiza configurações de regras de coins
 */
export async function updateCoinRules(rules: Record<string, number>): Promise<Record<string, number>> {
  return await put<Record<string, number>>('/api/admin/coin-rules', rules);
}