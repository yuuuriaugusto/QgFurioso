/**
 * Funções auxiliares para rotas e handlers
 */

/**
 * Verifica se o userId é válido e retorna um erro se não for
 * @param userId ID do usuário para verificar
 * @returns true se o userId for válido, Error caso contrário
 */
export function validateUserId(userId: number | undefined): userId is number {
  return userId !== undefined;
}

/**
 * Extrai o userId da requisição e valida
 * @param req Objeto de requisição com propriedade user opcional
 * @returns ID do usuário ou throws Error com mensagem amigável
 */
export function getUserIdOrThrow(req: { user?: { id?: number } }): number {
  const userId = req.user?.id;
  
  if (!validateUserId(userId)) {
    throw new Error("Usuário não autenticado");
  }
  
  return userId;
}

/**
 * Obtém o gerenciador de WebSocket global
 * Implementação temporária até termos uma solução melhor
 */
let _wsManager: any = null;

export function setWebSocketManager(manager: any) {
  _wsManager = manager;
}

export function getWebSocketManager() {
  return _wsManager;
}