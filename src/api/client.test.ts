import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAdminToken, setAdminToken } from './auth';
import { ApiError, fetchHealth, fetchSummary } from './client';

describe('API Client (AC-2A-04, AC-2A-05 / F-03)', () => {
  beforeEach(() => {
    clearAdminToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearAdminToken();
    vi.restoreAllMocks();
  });

  it('fetches summary with injected Authorization header when token exists', async () => {
    setAdminToken('my-secret-token');

    const mockSummary = {
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 137090585,
      prev_spend_micros: 141859142,
      projected_month_micros: 136013816,
      daily: [],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSummary,
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await fetchSummary(30);

    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/summary?days=30',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-secret-token',
        }),
      }),
    );
    expect(data.spend_micros).toBe(137090585);
  });

  it('throws ApiError and triggers auth notification on 401 Unauthorized', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSummary(7)).rejects.toThrow(ApiError);
  });

  it('throws ApiError on other HTTP errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => 'Backend down',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSummary(7)).rejects.toThrow('Backend down');
  });

  it('throws default error message if error body is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSummary(7)).rejects.toThrow('Falha na comunicação com o backend (500)');
  });

  it('fetches health successfully', async () => {
    const mockHealth = {
      status: 'ok',
      services: { edge: 'ok', budget: 'ok', control: 'ok', gateway: 'ok', usage: 'ok' },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockHealth,
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await fetchHealth();
    expect(data.status).toBe('ok');
    expect(fetchMock).toHaveBeenCalledWith('/health', expect.any(Object));
  });
});
