import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { ProjectsPage } from './ProjectsPage';

describe('ProjectsPage (AC-24 / F-12b)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ErrorBanner on failure and retries on button click', async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(client, 'fetchSummary')
      .mockRejectedValueOnce(new Error('Erro ao carregar projetos'))
      .mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 0,
        prev_spend_micros: 0,
        projected_month_micros: 0,
        daily: [],
        by_key: [],
      });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar projetos')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Nenhum projeto ou chave virtual ativa')).toBeInTheDocument();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it('renders EmptyState when key list is empty', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 0,
      prev_spend_micros: 0,
      projected_month_micros: 0,
      daily: [],
      by_key: [],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum projeto ou chave virtual ativa')).toBeInTheDocument();
    });
  });

  it('renders keys sorted by spend descending with budget gauges and AC-24 status badges', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 150000000,
      prev_spend_micros: 140000000,
      projected_month_micros: 150000000,
      daily: [],
      by_key: [
        {
          key_id: 'key-low-usage',
          name: 'App Mobile Dev',
          spend_micros: 20000000,
          budget_micros: 100000000,
          requests: 1200,
          tokens: 450000,
        },
        {
          key_id: 'key-near-limit',
          name: 'Backend API Staging',
          spend_micros: 85000000,
          budget_micros: 100000000,
          requests: 5000,
          tokens: 1200000,
        },
        {
          key_id: 'key-blocked',
          name: 'Analytics Worker Prod',
          spend_micros: 100000000,
          budget_micros: 100000000,
          requests: 9800,
          tokens: 3400000,
        },
      ],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('key-blocked')).toBeInTheDocument();
    });

    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    const blockedBadge = screen.getByText('Bloqueado').closest('.hig-status-badge');
    expect(blockedBadge).toHaveAttribute('data-variant', 'danger');

    expect(screen.getByText('Perto do limite')).toBeInTheDocument();
    const warningBadge = screen.getByText('Perto do limite').closest('.hig-status-badge');
    expect(warningBadge).toHaveAttribute('data-variant', 'warning');

    expect(screen.getByText('Normal')).toBeInTheDocument();
    const normalBadge = screen.getByText('Normal').closest('.hig-status-badge');
    expect(normalBadge).toHaveAttribute('data-variant', 'success');

    const meters = screen.getAllByRole('meter');
    expect(meters.length).toBe(3);
    expect(meters[0]).toHaveAttribute('aria-valuenow', '100');
    expect(meters[1]).toHaveAttribute('aria-valuenow', '85');
    expect(meters[2]).toHaveAttribute('aria-valuenow', '20');

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('key-blocked');
    expect(rows[2]).toHaveTextContent('key-near-limit');
    expect(rows[3]).toHaveTextContent('key-low-usage');
  });

  it('evaluates exact budget threshold boundaries without premature rounding', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 500000000,
      prev_spend_micros: 400000000,
      projected_month_micros: 500000000,
      daily: [],
      by_key: [
        {
          key_id: 'key-79.5',
          name: 'Under 80 Percent',
          spend_micros: 79500000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
        {
          key_id: 'key-79.9',
          name: 'Just Below 80 Percent',
          spend_micros: 79900000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
        {
          key_id: 'key-80.0',
          name: 'Exactly 80 Percent',
          spend_micros: 80000000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
        {
          key_id: 'key-99.5',
          name: 'Below 100 Percent Near Limit',
          spend_micros: 99500000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
        {
          key_id: 'key-99.9',
          name: 'Just Below 100 Percent Near Limit',
          spend_micros: 99900000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
        {
          key_id: 'key-100.0',
          name: 'Exactly 100 Percent Blocked',
          spend_micros: 100000000,
          budget_micros: 100000000,
          requests: 100,
          tokens: 10000,
        },
      ],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('key-100.0')).toBeInTheDocument();
    });

    const getRowBadge = (keyId: string) => {
      const row = screen.getByText(keyId).closest('tr');
      return row?.querySelector('.hig-status-badge');
    };

    expect(getRowBadge('key-79.5')).toHaveAttribute('data-variant', 'success');
    expect(getRowBadge('key-79.5')).toHaveTextContent('Normal');

    expect(getRowBadge('key-79.9')).toHaveAttribute('data-variant', 'success');
    expect(getRowBadge('key-79.9')).toHaveTextContent('Normal');

    expect(getRowBadge('key-80.0')).toHaveAttribute('data-variant', 'warning');
    expect(getRowBadge('key-80.0')).toHaveTextContent('Perto do limite');

    expect(getRowBadge('key-99.5')).toHaveAttribute('data-variant', 'warning');
    expect(getRowBadge('key-99.5')).toHaveTextContent('Perto do limite');

    expect(getRowBadge('key-99.9')).toHaveAttribute('data-variant', 'warning');
    expect(getRowBadge('key-99.9')).toHaveTextContent('Perto do limite');

    expect(getRowBadge('key-100.0')).toHaveAttribute('data-variant', 'danger');
    expect(getRowBadge('key-100.0')).toHaveTextContent('Bloqueado');
  });

  it('renders keys gracefully when budget_micros is undefined', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 15000000,
      prev_spend_micros: 10000000,
      projected_month_micros: 15000000,
      daily: [],
      by_key: [
        {
          key_id: 'key-no-budget',
          spend_micros: 15000000,
          requests: 500,
          tokens: 150000,
        },
      ],
    });

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('key-no-budget')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText(/Sem limite definido/i)).toBeInTheDocument();
    });
  });
});
