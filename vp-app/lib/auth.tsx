import * as Device from 'expo-device';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { ApiError, apiFetch, setAuthToken, setUnauthorizedHandler } from './api';
import { tokenStorage } from './storage';

/**
 * Espelha o que `GET /api/user` retorna hoje (ver ApiAuthController::getUser).
 * `active_modules` e `pest_control_permissions` ainda não existem nessa
 * resposta — são um item pendente do contrato de API (Etapa 1) a resolver
 * no backend antes da Etapa 2 (checagem de disponibilidade do módulo).
 */
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  tenant_id: number | null;
  account_type?: string | null;
  can_manage_catalog?: boolean;
  can_manage_team?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deviceName(): string {
  const name = Device.deviceName ?? `${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.trim();

  return name || 'Aparelho VetorPet';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true, isAuthenticated: false });

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await tokenStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  // Sessão expirada/token revogado em qualquer chamada: derruba a sessão
  // local também, sem esperar o usuário tocar em algo.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restaura a sessão ao abrir o app: se houver token salvo, valida contra
  // a API antes de liberar a navegação.
  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();

      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      setAuthToken(token);

      try {
        const user = await apiFetch<AuthUser>('/api/user');
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        await clearSession();
      }
    })();
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await apiFetch<{ token: string }>('/api/login', {
        method: 'POST',
        body: { email, password, device_name: deviceName() },
      });

      await tokenStorage.set(token);
      setAuthToken(token);

      try {
        const user = await apiFetch<AuthUser>('/api/user');
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch (error) {
        await clearSession();
        throw error;
      }
    },
    [clearSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch {
      // Mesmo se o servidor não responder, a sessão local é encerrada.
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({ ...state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider.');
  }

  return context;
}

export { ApiError };
