import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from './client';
import type { SummaryResponse } from './types';
import summaryFixture from '../test/fixtures/summary.example.json';
import { OverviewPage } from '../pages/OverviewPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProvidersPage } from '../pages/ProvidersPage';

describe('Canonical Contract Verification (BUG-01 / summary.example.json)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders OverviewPage successfully with canonical summary fixture', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue(summaryFixture as unknown as SummaryResponse);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/Custo Total/i)).toBeInTheDocument();
      expect(screen.getByText(/Projeção Mensal/i)).toBeInTheDocument();
      expect(screen.getByText(/Consumo Diário Recente/i)).toBeInTheDocument();
    });
  });

  it('renders ProjectsPage with by_key items from canonical fixture', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue(summaryFixture as unknown as SummaryResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Nenhum projeto ou chave virtual ativa')).not.toBeInTheDocument();
      expect(screen.getByText('key-mobile-api')).toBeInTheDocument();
      expect(screen.getByText('key-prod-backend')).toBeInTheDocument();
      expect(screen.getByText('key-analytics-worker')).toBeInTheDocument();
    });
  });

  it('renders ProvidersPage with by_provider and by_model items from canonical fixture', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue(summaryFixture as unknown as SummaryResponse);

    render(<ProvidersPage />);

    await waitFor(() => {
      expect(screen.queryByText('Nenhum provedor ativo no momento')).not.toBeInTheDocument();
      expect(screen.getByText('anthropic')).toBeInTheDocument();
      expect(screen.getByText('openai')).toBeInTheDocument();
      expect(screen.getByText('claude-3-opus-20240229')).toBeInTheDocument();
      expect(screen.getByText('gpt-4o')).toBeInTheDocument();
    });
  });
});
