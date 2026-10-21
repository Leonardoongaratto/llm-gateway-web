import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { EventsPage } from './EventsPage';

describe('EventsPage (AC-24 / F-12d)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ErrorBanner on failure and retries on button click', async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(client, 'fetchSummary')
      .mockRejectedValueOnce(new Error('Falha ao obter eventos'))
      .mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 0,
        prev_spend_micros: 0,
        projected_month_micros: 0,
        daily: [],
        events: [],
      });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Falha ao obter eventos')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Nenhum evento registrado')).toBeInTheDocument();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it('renders EmptyState when events list is empty', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 0,
      prev_spend_micros: 0,
      projected_month_micros: 0,
      daily: [],
      events: [],
    });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum evento registrado')).toBeInTheDocument();
      expect(
        screen.getByText(/Eventos de auditoria, atualizações de orçamento e fallbacks do NATS/i),
      ).toBeInTheDocument();
    });
  });

  it('renders distinct AC-24 badges for different event types', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 10000000,
      prev_spend_micros: 10000000,
      projected_month_micros: 10000000,
      daily: [],
      events: [
        {
          id: 'ev-1',
          type: 'usage',
          timestamp: '2026-10-21T10:00:00Z',
          key_id: 'key-backend-prod',
          provider: 'openai',
          model: 'gpt-4o',
          cost_micros: 12000,
          status: 'success',
          message: 'Chamada de inferência finalizada',
        },
        {
          id: 'ev-2',
          type: 'budget.threshold',
          timestamp: '2026-10-21T10:05:00Z',
          key_id: 'key-backend-prod',
          status: 'warning',
          message: 'Consumo atingiu 80% do limite mensal',
        },
        {
          id: 'ev-3',
          type: 'provider.fallback',
          timestamp: '2026-10-21T10:10:00Z',
          key_id: 'key-backend-prod',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          status: 'warning',
          message: 'Falha 503 na OpenAI, redirecionando para Anthropic',
        },
        {
          id: 'ev-4',
          type: 'config.changed',
          timestamp: '2026-10-21T10:15:00Z',
          key_id: 'admin',
          status: 'info',
          message: 'Taxa de cache ajustada',
        },
      ],
    });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Chamada de inferência finalizada')).toBeInTheDocument();
    });

    // AC-24: Check each event type badge and variant within table
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(5);

    const row1Badge = rows[1]?.querySelector('.hig-status-badge');
    const row2Badge = rows[2]?.querySelector('.hig-status-badge');
    const row3Badge = rows[3]?.querySelector('.hig-status-badge');
    const row4Badge = rows[4]?.querySelector('.hig-status-badge');

    expect(row1Badge).toHaveAttribute('data-variant', 'info');
    expect(row1Badge).toHaveTextContent('Uso');

    expect(row2Badge).toHaveAttribute('data-variant', 'warning');
    expect(row2Badge).toHaveTextContent('Orçamento');

    expect(row3Badge).toHaveAttribute('data-variant', 'fallback');
    expect(row3Badge).toHaveTextContent('Fallback');

    expect(row4Badge).toHaveAttribute('data-variant', 'neutral');
    expect(row4Badge).toHaveTextContent('Configuração');

    const variants = [row1Badge, row2Badge, row3Badge, row4Badge].map((b) => b?.getAttribute('data-variant'));
    expect(new Set(variants).size).toBe(4);

    expect(screen.getAllByText('key-backend-prod')).toHaveLength(3);
    expect(screen.getByText('$0.01')).toBeInTheDocument();
  });

  it('renders danger badge when budget.threshold event has status error', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 10000000,
      prev_spend_micros: 10000000,
      projected_month_micros: 10000000,
      daily: [],
      events: [
        {
          id: 'ev-err',
          type: 'budget.threshold',
          status: 'error',
          timestamp: '2026-10-21T10:00:00Z',
          key_id: 'key-exceeded',
          message: 'Limite do orçamento atingido',
        },
      ],
    });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Limite do orçamento atingido')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    const badge = table.querySelector('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'danger');
  });

  it('allows filtering events by type', async () => {
    const user = userEvent.setup();
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 10000000,
      prev_spend_micros: 10000000,
      projected_month_micros: 10000000,
      daily: [],
      events: [
        {
          id: 'ev-1',
          type: 'usage',
          timestamp: '2026-10-21T10:00:00Z',
          key_id: 'key-1',
          message: 'Chamada normal',
        },
        {
          id: 'ev-2',
          type: 'provider.fallback',
          timestamp: '2026-10-21T10:05:00Z',
          key_id: 'key-2',
          message: 'Fallback disparado',
        },
      ],
    });

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Chamada normal')).toBeInTheDocument();
      expect(screen.getByText('Fallback disparado')).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox', { name: /filtrar por tipo/i });
    await user.selectOptions(filterSelect, 'provider.fallback');

    expect(screen.queryByText('Chamada normal')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback disparado')).toBeInTheDocument();

    await user.selectOptions(filterSelect, 'config.changed');
    expect(screen.getByText('Nenhum evento deste tipo no período')).toBeInTheDocument();
  });
});
