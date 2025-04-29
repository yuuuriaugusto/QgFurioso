import { NewsContent, Survey, SurveyQuestion, PaginationParams, SortParams } from '@types';
import { get, post, patch, del } from './api';

// ===== Gerenciamento de Conteúdo de Notícias =====

/**
 * Busca conteúdos de notícias com filtros e paginação
 */
export async function fetchNewsContent(
  filters: {
    status?: string;
    category?: string;
    author?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: NewsContent[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.author) queryParams.append('author', filters.author);
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: NewsContent[]; total: number }>(`/api/admin/content/news?${queryParams.toString()}`);
}

/**
 * Busca um conteúdo específico por ID
 */
export async function fetchNewsContentById(id: number): Promise<NewsContent> {
  return await get<NewsContent>(`/api/admin/content/news/${id}`);
}

/**
 * Cria um novo conteúdo
 */
export async function createNewsContent(content: Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsContent> {
  return await post<NewsContent>('/api/admin/content/news', content);
}

/**
 * Atualiza um conteúdo existente
 */
export async function updateNewsContent(id: number, content: Partial<Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<NewsContent> {
  return await patch<NewsContent>(`/api/admin/content/news/${id}`, content);
}

/**
 * Atualiza o status de um conteúdo (publicar/despublicar)
 */
export async function updateNewsStatus(id: number, status: 'published' | 'draft'): Promise<NewsContent> {
  return await patch<NewsContent>(`/api/admin/content/news/${id}/status`, { status });
}

/**
 * Remove um conteúdo
 */
export async function deleteNewsContent(id: number): Promise<boolean> {
  return await del<boolean>(`/api/admin/content/news/${id}`);
}

/**
 * Faz upload de uma imagem para o conteúdo
 */
export async function uploadContentImage(formData: FormData): Promise<{ url: string }> {
  return await post<{ url: string }>('/api/admin/content/upload', formData, true);
}

// ===== Gerenciamento de Pesquisas =====

/**
 * Busca pesquisas com filtros e paginação
 */
export async function fetchSurveys(
  filters: {
    status?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: Survey[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.search) queryParams.append('search', filters.search);
  
  // Adiciona paginação
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  // Adiciona ordenação
  queryParams.append('sortField', sort.field);
  queryParams.append('sortOrder', sort.order);
  
  return await get<{ data: Survey[]; total: number }>(`/api/admin/surveys?${queryParams.toString()}`);
}

/**
 * Busca uma pesquisa específica por ID
 */
export async function fetchSurvey(id: number): Promise<Survey> {
  return await get<Survey>(`/api/admin/surveys/${id}`);
}

/**
 * Busca as perguntas de uma pesquisa
 */
export async function fetchSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
  return await get<SurveyQuestion[]>(`/api/admin/surveys/${surveyId}/questions`);
}

/**
 * Busca os resultados agregados de uma pesquisa
 */
export async function fetchSurveyResults(surveyId: number): Promise<any> {
  return await get<any>(`/api/admin/surveys/${surveyId}/results`);
}

/**
 * Busca as respostas individuais de uma pesquisa com paginação
 */
export async function fetchSurveyResponses(
  surveyId: number, 
  pagination: PaginationParams = { page: 1, pageSize: 5 }
): Promise<{ data: any[]; total: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  return await get<{ data: any[]; total: number }>(`/api/admin/surveys/${surveyId}/responses?${queryParams.toString()}`);
}

/**
 * Cria uma nova pesquisa com perguntas
 */
export async function createSurvey(
  survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>,
  questions: Omit<SurveyQuestion, 'id' | 'surveyId'>[]
): Promise<Survey> {
  return await post<Survey>('/api/admin/surveys', { survey, questions });
}

/**
 * Atualiza uma pesquisa existente
 */
export async function updateSurvey(
  id: number,
  survey: Partial<Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>>,
  questions?: Omit<SurveyQuestion, 'surveyId'>[]
): Promise<Survey> {
  return await patch<Survey>(`/api/admin/surveys/${id}`, { survey, questions });
}

/**
 * Atualiza o status de uma pesquisa
 */
export async function updateSurveyStatus(id: number, status: string): Promise<Survey> {
  return await patch<Survey>(`/api/admin/surveys/${id}/status`, { status });
}

/**
 * Remove uma pesquisa
 */
export async function deleteSurvey(id: number): Promise<boolean> {
  return await del<boolean>(`/api/admin/surveys/${id}`);
}