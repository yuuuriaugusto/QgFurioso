import { queryClient } from './queryClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Função para fazer requisições à API
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    ...options,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
    throw Object.assign(error, {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
  }
  
  return response;
}

/**
 * Função genérica para buscar dados da API 
 */
export const getQueryFn = <T>(options: { on401: 'returnNull' | 'throw' }) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    const [endpoint] = queryKey;
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      // Handle no content responses
      if (response.status === 204) {
        return undefined;
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.status === 401 && options.on401 === 'returnNull') {
        return undefined;
      }
      throw error;
    }
  };
};

/**
 * Função para invalidar cache depois de mutações
 */
export function invalidateQueries(keys: string[]) {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
}