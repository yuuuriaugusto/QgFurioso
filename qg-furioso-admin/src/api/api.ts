const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Função base para requisições à API
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  customHeaders: Record<string, string> = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Importante para enviar/receber cookies
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Verifica erros de autenticação
  if (response.status === 401) {
    throw new Error('Não autenticado');
  }
  
  // Verifica outros erros
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Erro ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

/**
 * Função auxiliar para requisições GET
 */
export async function get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
  const response = await apiRequest('GET', endpoint, undefined, customHeaders);
  return await response.json();
}

/**
 * Função auxiliar para requisições POST
 */
export async function post<T>(endpoint: string, data?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  const response = await apiRequest('POST', endpoint, data, customHeaders);
  return await response.json();
}

/**
 * Função auxiliar para requisições PUT
 */
export async function put<T>(endpoint: string, data?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  const response = await apiRequest('PUT', endpoint, data, customHeaders);
  return await response.json();
}

/**
 * Função auxiliar para requisições DELETE
 */
export async function del<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
  const response = await apiRequest('DELETE', endpoint, undefined, customHeaders);
  return await response.json();
}