import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { EventsPage } from './EventsPage';
import { ProjectsPage } from './ProjectsPage';
import { ProvidersPage } from './ProvidersPage';

describe('ProjectsPage, ProvidersPage and EventsPage states', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ProjectsPage', () => {
    it('renders ErrorBanner on failure and retries', async () => {
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

    it('renders project list when data is available', async () => {
      vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 25000000,
        prev_spend_micros: 20000000,
        projected_month_micros: 30000000,
        daily: [],
        by_key: [
          {
            key_id: 'lgw_proj_alpha',
            spend_micros: 15000000,
            requests: 1200,
            tokens: 450000,
          },
        ],
      });

      render(<ProjectsPage />);

      await waitFor(() => {
        expect(screen.getByText('lgw_proj_alpha')).toBeInTheDocument();
        expect(screen.getByText('$15.00')).toBeInTheDocument();
      });
    });
  });

  describe('ProvidersPage', () => {
    it('renders ErrorBanner on failure and EmptyState when empty', async () => {
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
      });

      const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
      await user.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Nenhum provedor ativo no momento')).toBeInTheDocument();
        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    it('renders providers and models table', async () => {
      vi.spyOn(client, 'fetchSummary').mockResolvedValueOnce({
        period_days: 30,
        start_date: '2026-09-17',
        end_date: '2026-10-17',
        spend_micros: 5000000,
        prev_spend_micros: 4000000,
        projected_month_micros: 6000000,
        daily: [],
        by_provider: [
          { provider: 'OpenAI', spend_micros: 3000000, requests: 800, tokens: 200000 },
          { provider: 'Anthropic', spend_micros: 2000000, requests: 400, tokens: 100000 },
        ],
        by_model: [
          {
            model: 'gpt-4o',
            spend_micros: 3000000,
            requests: 800,
            tokens: 200000,
          },
        ],
      });

      render(<ProvidersPage />);

      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
        expect(screen.getByText('Anthropic')).toBeInTheDocument();
        expect(screen.getByText('gpt-4o')).toBeInTheDocument();
      });
    });
  });

  describe('EventsPage', () => {
    it('renders EmptyState for NATS events', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum evento registrado')).toBeInTheDocument();
        expect(
          screen.getByText(/Eventos de auditoria, atualizações de orçamento e fallbacks do NATS/i),
        ).toBeInTheDocument();
      });
    });
  });
});
