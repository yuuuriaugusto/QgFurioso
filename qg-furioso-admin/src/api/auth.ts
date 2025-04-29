import { AdminUser, AdminLoginCredentials } from '@types';
import { get, post } from './api';

/**
 * Realiza login de administrador
 * @param credentials Credenciais de login
 * @returns Dados do usuário admin autenticado
 */
export async function loginAdmin(credentials: AdminLoginCredentials): Promise<AdminUser> {
  return await post<AdminUser>('/api/admin/auth/login', credentials);
}

/**
 * Realiza logout do administrador
 */
export async function logoutAdmin(): Promise<void> {
  await post<void>('/api/admin/auth/logout');
}

/**
 * Obtém dados do administrador atualmente autenticado
 * @returns Dados do usuário admin ou null se não estiver autenticado
 */
export async function fetchCurrentAdmin(): Promise<AdminUser | null> {
  try {
    return await get<AdminUser>('/api/admin/auth/me');
  } catch (error) {
    return null;
  }
}