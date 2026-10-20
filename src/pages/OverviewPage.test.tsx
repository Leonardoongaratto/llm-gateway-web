import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { OverviewPage } from './OverviewPage';

describe('OverviewPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ErrorBanner on fetch failure and retries on button click', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(client, 'fetchSummary')
      .mockRejectedValueOnce({ message: 'Falha no Edge Proxy', status: 502 })
      .mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 2000000,
        prev_spend_micros: 1000000,
        projected_month_micros: 2000000,
        daily: [{ date: '2026-09-17', spend_micros: 2000000, requests: 10, tokens: 500 }],
      });

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Falha no Edge Proxy')).toBeInTheDocument();
      expect(screen.getByText('Erro 502')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Custo Total (30d)')).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('renders EmptyState when response has zero spend and empty daily list', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue({
      period_days: 30,
      start_date: '2026-09-17',
      end_date: '2026-10-17',
      spend_micros: 0,
      prev_spend_micros: 0,
      projected_month_micros: 0,
      daily: [],
    });

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum dado registrado ainda neste período')).toBeInTheDocument();
      expect(screen.getByText(/curl -X POST/i)).toBeInTheDocument();
    });
  });
});
