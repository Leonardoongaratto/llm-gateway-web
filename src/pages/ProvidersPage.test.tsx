import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { ProvidersPage } from './ProvidersPage';

describe('ProvidersPage (AC-24 / F-12c)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ErrorBanner on failure and retries on button click', async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(client, 'fetchSummary')
      .mockRejectedValueOnce(new Error('Falha nos provedores'))
      .mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 0,
        prev_spend_micros: 0,
        projected_month_micros: 0,
        daily: [],
        by_provider: [],
        by_model: [],
      });

    render(<ProvidersPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Falha nos provedores')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Nenhum provedor ativo no momento')).toBeInTheDocument();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it('renders EmptyState when neither providers nor models exist', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 0,
      prev_spend_micros: 0,
      projected_month_micros: 0,
      daily: [],
      by_provider: [],
      by_model: [],
    });

    render(<ProvidersPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum provedor ativo no momento')).toBeInTheDocument();
    });
  });

  it('renders AC-24 provider status indicators (Operando, Instavel, Fora) and latency', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 60000000,
      prev_spend_micros: 50000000,
      projected_month_micros: 60000000,
      daily: [],
      by_provider: [
        {
          provider: 'anthropic',
          spend_micros: 35000000,
          requests: 1200,
          tokens: 500000,
          latency_p50_ms: 320,
          latency_p99_ms: 1250,
          failures_24h: 0,
        },
        {
          provider: 'openai',
          spend_micros: 20000000,
          requests: 900,
          tokens: 300000,
          latency_p50_ms: 450,
          latency_p99_ms: 2100,
          failures_24h: 3,
        },
        {
          provider: 'gemini',
          spend_micros: 5000000,
          requests: 200,
          tokens: 80000,
          status: 'down',
          failures_24h: 15,
        },
      ],
      by_model: [
        {
          model: 'claude-3-5-sonnet',
          spend_micros: 35000000,
          requests: 1200,
          tokens: 500000,
        },
        {
          model: 'gpt-4o',
          spend_micros: 20000000,
          requests: 900,
          tokens: 300000,
        },
      ],
    });

    render(<ProvidersPage />);

    await waitFor(() => {
      expect(screen.getByText('anthropic')).toBeInTheDocument();
      expect(screen.getByText('openai')).toBeInTheDocument();
      expect(screen.getByText('gemini')).toBeInTheDocument();
    });

    expect(screen.getByText('Operando')).toBeInTheDocument();
    const operandoBadge = screen.getByText('Operando').closest('.hig-status-badge');
    expect(operandoBadge).toHaveAttribute('data-variant', 'success');

    expect(screen.getByText('Instável')).toBeInTheDocument();
    const instavelBadge = screen.getByText('Instável').closest('.hig-status-badge');
    expect(instavelBadge).toHaveAttribute('data-variant', 'warning');

    expect(screen.getByText('Fora')).toBeInTheDocument();
    const foraBadge = screen.getByText('Fora').closest('.hig-status-badge');
    expect(foraBadge).toHaveAttribute('data-variant', 'danger');

    expect(screen.getByText(/320ms/)).toBeInTheDocument();
    expect(screen.getByText(/1250ms/)).toBeInTheDocument();
    expect(screen.getByText(/3 falhas/)).toBeInTheDocument();

    // Check models table
    expect(screen.getByText('claude-3-5-sonnet')).toBeInTheDocument();
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
  });
});
