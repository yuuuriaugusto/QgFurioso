import { NewsContent, Survey, SurveyQuestion, PaginationParams, SortParams } from '@types';
import { get, post, put, del } from './api';

// ================= News Content API =================

/**
 * Busca lista de conteúdos de notícias com filtros e paginação
 */
export async function fetchNewsContent(
  filters: {
    isPublished?: boolean;
    category?: string;
    search?: string;
  } = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 },
  sort: SortParams = { field: 'createdAt', order: 'descend' }
): Promise<{ data: NewsContent[]; total: number }> {
  const queryParams = new URLSearchParams();
  
  // Adiciona filtros
  if (filters.isPublished !== undefined) queryParams.append('isPublished', filters.isPublished.toString());
  if (filters.category) queryParams.append('category', filters.category);
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
 * Busca detalhes de um conteúdo específico
 */
export async function fetchNewsContentById(contentId: number): Promise<NewsContent> {
  return await get<NewsContent>(`/api/admin/content/news/${contentId}`);
}

/**
 * Cria um novo conteúdo de notícia
 */
export async function createNewsContent(content: Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsContent> {
  return await post<NewsContent>('/api/admin/content/news', content);
}

/**
 * Atualiza um conteúdo de notícia existente
 */
export async function updateNewsContent(
  contentId: number, 
  content: Partial<Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<NewsContent> {
  return await put<NewsContent>(`/api/admin/content/news/${contentId}`, content);
}

/**
 * Altera o status de publicação (publicado/rascunho)
 */
export async function toggleNewsContentPublishStatus(contentId: number, isPublished: boolean): Promise<NewsContent> {
  return await put<NewsContent>(`/api/admin/content/news/${contentId}/publish`, { isPublished });
}

/**
 * Remove um conteúdo de notícia
 */
export async function deleteNewsContent(contentId: number): Promise<void> {
  await del(`/api/admin/content/news/${contentId}`);
}

// ================= Surveys API =================

/**
 * Busca lista de pesquisas com filtros e paginação
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
 * Busca detalhes de uma pesquisa específica
 */
export async function fetchSurvey(surveyId: number): Promise<Survey> {
  return await get<Survey>(`/api/admin/surveys/${surveyId}`);
}

/**
 * Busca perguntas de uma pesquisa
 */
export async function fetchSurveyQuestions(surveyId: number): Promise<SurveyQuestion[]> {
  return await get<SurveyQuestion[]>(`/api/admin/surveys/${surveyId}/questions`);
}

/**
 * Cria uma nova pesquisa
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
  surveyId: number,
  survey: Partial<Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>>,
  questions?: Omit<SurveyQuestion, 'surveyId'>[]
): Promise<Survey> {
  return await put<Survey>(`/api/admin/surveys/${surveyId}`, { survey, questions });
}

/**
 * Altera o status de uma pesquisa
 */
export async function updateSurveyStatus(surveyId: number, status: string): Promise<Survey> {
  return await put<Survey>(`/api/admin/surveys/${surveyId}/status`, { status });
}

/**
 * Remove uma pesquisa
 */
export async function deleteSurvey(surveyId: number): Promise<void> {
  await del(`/api/admin/surveys/${surveyId}`);
}

/**
 * Busca resultados agregados de uma pesquisa
 */
export async function fetchSurveyResults(surveyId: number): Promise<any> {
  return await get<any>(`/api/admin/surveys/${surveyId}/results`);
}

/**
 * Busca as respostas de uma pesquisa
 */
export async function fetchSurveyResponses(
  surveyId: number,
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<{ data: any[]; total: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', pagination.page.toString());
  queryParams.append('pageSize', pagination.pageSize.toString());
  
  return await get<{ data: any[]; total: number }>(`/api/admin/surveys/${surveyId}/responses?${queryParams.toString()}`);
}