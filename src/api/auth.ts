/**
 * Gerenciador de Autenticação Administrativa (sessionStorage)
 * Conforme especificações do LLM Gateway (LGW_ADMIN_TOKEN)
 */

export const ADMIN_TOKEN_KEY = 'LGW_ADMIN_TOKEN';

type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
  } catch {
    // sessionStorage indisponível
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // sessionStorage indisponível
  }
}

export function hasAdminToken(): boolean {
  const token = getAdminToken();
  return Boolean(token && token.length > 0);
}

export function onAuthRequired(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export function triggerAuthRequired(): void {
  authListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignora erro de listener individual
    }
  });
}
