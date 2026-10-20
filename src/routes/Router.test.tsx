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
    by_key: [{ key_id: 'vk_1', spend_micros: 500000, requests: 2, tokens: 100 }],
    by_provider: [{ provider: 'anthropic', spend_micros: 500000, requests: 2, tokens: 100 }],
    by_model: [{ model: 'claude-3-7-sonnet', spend_micros: 500000, requests: 2, tokens: 100 }],
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

  it('renders overview page on "/dashboard" and updates document.title', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Gasto no período')).toBeInTheDocument();
      expect(screen.getAllByText('$1.00').length).toBeGreaterThanOrEqual(1);
      expect(document.title).toBe('Visão Geral · LLM Gateway');
    });
  });

  it('renders projects page on "/dashboard/projetos" and updates document.title', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/projetos']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chaves Virtuais e Orçamentos')).toBeInTheDocument();
      expect(screen.getByText('vk_1')).toBeInTheDocument();
      expect(document.title).toBe('Projetos e Chaves · LLM Gateway');
    });
  });

  it('renders providers page on "/dashboard/provedores" and updates document.title', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/provedores']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Consumo por Provedor Conectado')).toBeInTheDocument();
      expect(screen.getByText('anthropic')).toBeInTheDocument();
      expect(document.title).toBe('Provedores e Modelos · LLM Gateway');
    });
  });

  it('renders events page on "/dashboard/eventos" and updates document.title', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/eventos']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum evento registrado')).toBeInTheDocument();
      expect(document.title).toBe('Auditoria e Eventos · LLM Gateway');
    });
  });

  it('renders settings page on "/dashboard/ajustes" and updates document.title', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/ajustes']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Conectividade com o Edge Proxy')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar chave/i })).toBeInTheDocument();
      expect(document.title).toBe('Ajustes e Configurações · LLM Gateway');
    });
  });

  it('redirects root "/" to "/dashboard"', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Gasto no período')).toBeInTheDocument();
      expect(document.title).toBe('Visão Geral · LLM Gateway');
    });
  });

  it('redirects unknown route to "/dashboard"', async () => {
    render(
      <MemoryRouter initialEntries={['/rota-desconhecida']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Gasto no período')).toBeInTheDocument();
    });
  });
});
