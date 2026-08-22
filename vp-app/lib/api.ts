import { API_URL } from './config';

/**
 * Erro de API tipado: preserva o status HTTP e, quando o backend Laravel
 * responde 422, o dicionário `errors` (campo -> mensagens) para exibir nos
 * formulários.
 */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Chamado pelo AuthProvider quando o token muda (login/logout/restauração). */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Chamado pelo AuthProvider para reagir a um 401 (sessão expirada/revogada). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * Cliente HTTP fino sobre `fetch`. Sem dependência de terceiros: a base do
 * app é pequena o suficiente para não justificar axios/react-query ainda
 * (isso pode mudar a partir da Etapa 7, quando a fila de sincronização
 * ficar mais complexa).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // Falha de rede (offline, DNS, timeout do fetch). Etapas seguintes
    // decidem, por endpoint, se isso vira fila local ou erro visível.
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Não foi possível completar a operação.', response.status, payload?.errors);
  }

  return payload as T;
}
