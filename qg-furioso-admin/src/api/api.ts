/**
 * Classe base para erros de API
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Configuração padrão para requisições
 */
const baseConfig = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Busca o token csrf da cookie e adiciona no header
 */
function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Função para verificar se a resposta está ok e retornar os dados
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Erro desconhecido');
    let errorMessage: string;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || 'Erro desconhecido';
    } catch {
      errorMessage = errorText || `Erro HTTP ${response.status}`;
    }
    
    throw new ApiError(errorMessage, response.status);
  }
  
  // Se for uma resposta 204 (No Content), retorna null
  if (response.status === 204) {
    return null as unknown as T;
  }
  
  // Se for uma resposta vazia, retorna um objeto vazio
  if (response.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  return await response.json();
}

/**
 * Função para fazer requisição GET
 */
export async function get<T>(endpoint: string): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = csrfToken 
    ? { ...baseConfig.headers, 'X-CSRFToken': csrfToken } 
    : baseConfig.headers;
  
  const response = await fetch(endpoint, {
    method: 'GET',
    ...baseConfig,
    headers,
  });
  
  return handleResponse<T>(response);
}

/**
 * Função para fazer requisição POST
 */
export async function post<T>(endpoint: string, data: any = {}, isFormData = false): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = csrfToken 
    ? { ...baseConfig.headers, 'X-CSRFToken': csrfToken } 
    : baseConfig.headers;
  
  // Se for FormData, não incluir Content-Type para que o navegador defina automaticamente
  // com o boundary correto
  const config = isFormData 
    ? { 
        method: 'POST',
        credentials: baseConfig.credentials, 
        body: data,
        headers: { 'X-CSRFToken': csrfToken || '' }
      } 
    : {
        method: 'POST',
        ...baseConfig,
        headers,
        body: JSON.stringify(data),
      };
  
  const response = await fetch(endpoint, config);
  
  return handleResponse<T>(response);
}

/**
 * Função para fazer requisição PATCH
 */
export async function patch<T>(endpoint: string, data: any = {}): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = csrfToken 
    ? { ...baseConfig.headers, 'X-CSRFToken': csrfToken } 
    : baseConfig.headers;
  
  const response = await fetch(endpoint, {
    method: 'PATCH',
    ...baseConfig,
    headers,
    body: JSON.stringify(data),
  });
  
  return handleResponse<T>(response);
}

/**
 * Função para fazer requisição PUT
 */
export async function put<T>(endpoint: string, data: any = {}): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = csrfToken 
    ? { ...baseConfig.headers, 'X-CSRFToken': csrfToken } 
    : baseConfig.headers;
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    ...baseConfig,
    headers,
    body: JSON.stringify(data),
  });
  
  return handleResponse<T>(response);
}

/**
 * Função para fazer requisição DELETE
 */
export async function del<T>(endpoint: string): Promise<T> {
  const csrfToken = getCSRFToken();
  const headers = csrfToken 
    ? { ...baseConfig.headers, 'X-CSRFToken': csrfToken } 
    : baseConfig.headers;
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    ...baseConfig,
    headers,
  });
  
  return handleResponse<T>(response);
}