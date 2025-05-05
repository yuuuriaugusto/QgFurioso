/**
 * Serviço de autenticação para integração com provedores externos
 * e funcionalidades relacionadas a autenticação
 * 
 * @version 2.5.0
 * @author Equipe QG FURIOSO
 * @copyright FURIA Esports 2025
 */

/**
 * Redireciona o usuário para a página de login do Google
 */
export function loginWithGoogle(): void {
  window.location.href = '/auth/google';
}

/**
 * Redireciona o usuário para a página de login com credenciais
 */
export function loginWithCredentials(credentials: { username: string, password: string }): Promise<Response> {
  return fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
}

/**
 * Registra um novo usuário com credenciais
 */
export function registerWithCredentials(userData: any): Promise<Response> {
  return fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
    credentials: 'include',
  });
}

/**
 * Realiza o logout do usuário
 */
export function logout(): Promise<Response> {
  return fetch('/api/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Verifica os parâmetros da URL para extrair erros de autenticação
 */
export function getAuthErrorFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('error');
}

/**
 * Traduz códigos de erro de autenticação para mensagens amigáveis
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'google-auth-failed':
      return 'Falha na autenticação com Google. Por favor, tente novamente.';
    case 'invalid-credentials':
      return 'Email ou senha inválidos. Por favor, verifique suas credenciais.';
    case 'account-disabled':
      return 'Esta conta está desativada. Entre em contato com o suporte.';
    case 'email-already-exists':
      return 'Este email já está em uso. Tente fazer login ou use outro email.';
    default:
      return 'Ocorreu um erro durante a autenticação. Por favor, tente novamente.';
  }
}