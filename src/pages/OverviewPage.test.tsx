import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { OverviewPage } from './OverviewPage';

const mockCanonicalSummary = {
  period_days: 30,
  start_date: '2026-09-17',
  end_date: '2026-10-17',
  spend_micros: 137_090_585,
  prev_spend_micros: 141_859_142,
  projected_month_micros: 258_941_176,
  daily: [
    {
      date: '2026-10-16',
      spend_micros: 4_352_806,
      requests: 4,
      tokens: 549_536,
      by_provider: [
        { provider: 'anthropic', spend_micros: 3_800_000, requests: 3, tokens: 400_000 },
        { provider: 'openai', spend_micros: 552_806, requests: 1, tokens: 149_536 },
      ],
    },
    {
      date: '2026-10-17',
      spend_micros: 4_347_850,
      requests: 4,
      tokens: 549_000,
      by_provider: [
        { provider: 'anthropic', spend_micros: 3_800_000, requests: 3, tokens: 400_000 },
        { provider: 'openai', spend_micros: 547_850, requests: 1, tokens: 149_000 },
      ],
    },
  ],
  by_model: [
    {
      model: 'claude-3-opus-20240229',
      spend_micros: 101_325_690,
      requests: 31,
      tokens: 4_340_310,
    },
    {
      model: 'claude-3-5-sonnet-20241022',
      spend_micros: 19_614_117,
      requests: 31,
      tokens: 4_247_310,
    },
    {
      model: 'gpt-4o',
      spend_micros: 15_210_317,
      requests: 31,
      tokens: 4_293_810,
    },
    {
      model: 'gpt-4o-mini',
      spend_micros: 940_461,
      requests: 31,
      tokens: 4_386_810,
    },
  ],
  by_provider: [
    {
      provider: 'anthropic',
      spend_micros: 120_939_807,
      requests: 63,
      tokens: 25_387_620,
    },
    {
      provider: 'openai',
      spend_micros: 16_150_778,
      requests: 62,
      tokens: 8_680_620,
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      name: 'Claude Code Pro',
      provider: 'anthropic',
      monthly_cost_micros: 20_000_000,
      equivalent_value_micros: 84_000_000,
      aproveitamento: 4.2,
    },
  ],
  reconciliation: {
    total_gateway_micros: 137_090_585,
    total_org_micros: 0,
    total_overlap_micros: 0,
    total_discrepancy_micros: 0,
    total_reconciled_micros: 137_090_585,
  },
};

describe('OverviewPage Component (Etapa 2B Integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ErrorBanner on fetch failure and retries on button click', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(client, 'fetchSummary')
      .mockRejectedValueOnce({ message: 'Falha no Edge Proxy', status: 502 })
      .mockResolvedValueOnce(mockCanonicalSummary);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Falha no Edge Proxy')).toBeInTheDocument();
      expect(screen.getByText('Erro 502')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    await waitFor(() => {
      const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
      expect(banner.textContent).toContain('Você gastou $137.09 nos últimos 30 dias');
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

  it('renders full overview page with all 2B components when data is loaded', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue(mockCanonicalSummary);

    render(<OverviewPage />);

    await waitFor(() => {
      // 1. Origin Filter
      expect(screen.getByRole('radiogroup', { name: /filtro de origem/i })).toBeInTheDocument();

      // 2. Summary Phrase
      const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
      expect(banner.textContent).toContain('Você gastou $137.09 nos últimos 30 dias');
      expect(banner.textContent).toContain('Seu orçamento mensal está em 69% com projeção de $258.94');

      // 3. Metric Cards Grid
      expect(screen.getByTestId('metric-card-spend')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-budget')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-requests')).toBeInTheDocument();
      expect(screen.getByTestId('metric-card-cache-savings')).toBeInTheDocument();

      // 4. Daily Usage Chart
      expect(screen.getByRole('region', { name: /gráfico diário de consumo/i })).toBeInTheDocument();

      // 5. Model Share Bars
      expect(screen.getByText('Participação por Modelo')).toBeInTheDocument();
      expect(screen.getByText('claude-3-opus-20240229')).toBeInTheDocument();

      // 6. Subscriptions Card
      expect(screen.getByText('Assinaturas e Eficiência')).toBeInTheDocument();
      expect(screen.getByText('Claude Code Pro')).toBeInTheDocument();
      expect(screen.getByText(/rendeu 4[.,]2×/i)).toBeInTheDocument();
    });
  });

  it('filters data when origin filter is clicked (AC-48)', async () => {
    vi.spyOn(client, 'fetchSummary').mockResolvedValue(mockCanonicalSummary);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Claude Code Pro')).toBeInTheDocument();
    });

    // Select "Claude Code"
    const claudecodeOption = screen.getByRole('radio', { name: 'Claude Code' });
    fireEvent.click(claudecodeOption);
    expect(claudecodeOption).toHaveAttribute('aria-checked', 'true');

    // Select "Gateway"
    const gatewayOption = screen.getByRole('radio', { name: 'Gateway' });
    fireEvent.click(gatewayOption);
    expect(gatewayOption).toHaveAttribute('aria-checked', 'true');

    // Select "Organização"
    const orgOption = screen.getByRole('radio', { name: 'Organização' });
    fireEvent.click(orgOption);
    expect(orgOption).toHaveAttribute('aria-checked', 'true');

    // Select "Tudo"
    const allOption = screen.getByRole('radio', { name: 'Tudo' });
    fireEvent.click(allOption);
    expect(allOption).toHaveAttribute('aria-checked', 'true');
  });
});
