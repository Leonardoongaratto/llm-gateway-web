import { getAdminToken, triggerAuthRequired } from './auth';
import type { HealthResponse, SummaryResponse } from './types';

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchSummary(days = 30, signal?: AbortSignal): Promise<SummaryResponse> {
  const res = await fetch(`/admin/summary?days=${days}`, {
    method: 'GET',
    headers: buildHeaders(),
    signal,
  });

  if (!res.ok) {
    if (res.status === 401) {
      triggerAuthRequired();
      throw new ApiError(401, 'Autenticação necessária (LGW_ADMIN_TOKEN)');
    }
    const errorText = await res.text().catch(() => '');
    throw new ApiError(res.status, errorText || `Falha na comunicação com o backend (${res.status})`);
  }

  return (await res.json()) as SummaryResponse;
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch('/health', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Health check falhou (${res.status})`);
  }

  return (await res.json()) as HealthResponse;
}

export async function validateAdminToken(token: string, signal?: AbortSignal): Promise<boolean> {
  const clean = token.trim();
  if (!clean) return false;
  const res = await fetch('/admin/summary?days=7', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${clean}`,
    },
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    return false;
  }
  if (!res.ok) {
    throw new ApiError(res.status, `Falha na validação do token (${res.status})`);
  }
  return true;
}
