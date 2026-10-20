import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRouter } from './Router';

describe('AppRouter (AC-2A-09 / F-06)', () => {
  const mockSummary = {
    period_days: 30,
    start_date: '2026-09-17',
    end_date: '2026-10-17',
    spend_micros: 1000000,
    prev_spend_micros: 1000000,
    projected_month_micros: 1000000,
    daily: [{ date: '2026-09-17', spend_micros: 1000000, requests: 5, tokens: 200 }],
    keys: [{ key_id: 'vk_1', name: 'Projeto Demo', spend_micros: 500000, requests: 2, tokens: 100 }],
    providers: [{ provider: 'anthropic', status: 'healthy', latency_ms: 120, spend_micros: 500000 }],
    models: [{ model_id: 'claude-3-7-sonnet', spend_micros: 500000, requests: 2, tokens: 100 }],
    events: [{ id: 'ev_1', timestamp: '2026-10-17', type: 'budget.reserved', details: 'Reserva ok' }],
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('/admin/summary')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockSummary,
        };
      }
      if (typeof url === 'string' && url.includes('/health')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok' }),
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders overview page on "/dashboard"', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Custo Total (30d)')).toBeInTheDocument();
      expect(screen.getAllByText('$1.00').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders projects page on "/dashboard/projetos"', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/projetos']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chaves Virtuais e Orçamentos')).toBeInTheDocument();
      expect(screen.getByText('Projeto Demo')).toBeInTheDocument();
    });
  });

  it('renders providers page on "/dashboard/provedores"', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/provedores']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Saúde dos Provedores Conectados')).toBeInTheDocument();
      expect(screen.getByText('anthropic')).toBeInTheDocument();
    });
  });

  it('renders events page on "/dashboard/eventos"', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/eventos']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Log de Eventos e Auditoria NATS')).toBeInTheDocument();
      expect(screen.getByText('budget.reserved')).toBeInTheDocument();
    });
  });

  it('renders settings page on "/dashboard/ajustes"', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/ajustes']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Conectividade com o Edge Proxy')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar chave/i })).toBeInTheDocument();
    });
  });

  it('redirects root "/" to "/dashboard"', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Custo Total (30d)')).toBeInTheDocument();
    });
  });

  it('redirects unknown route to "/dashboard"', async () => {
    render(
      <MemoryRouter initialEntries={['/rota-desconhecida']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Custo Total (30d)')).toBeInTheDocument();
    });
  });
});
