import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCardsGrid } from './MetricCardsGrid';

describe('MetricCardsGrid (AC-18-Web, AC-19-Web, F-08, BUG-01, BUG-04)', () => {
  it('renders all 4 KPI cards with Apple HIG layout and proper formatting when telemetry is present', () => {
    render(
      <MetricCardsGrid
        spendMicros={137_090_585}
        prevSpendMicros={141_859_142}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
        monthSpendMicros={137_090_585}
        totalRequests={1250}
        cacheSavingsMicros={18_400_000}
        cacheRatePercent={34}
      />,
    );

    // Card 1: Gasto no período
    expect(screen.getByText('Gasto no período')).toBeInTheDocument();
    expect(screen.getByText('$137.09')).toBeInTheDocument();
    expect(screen.getByText(/3\.4%/)).toBeInTheDocument();
    expect(screen.getByText(/vs\. período anterior/i)).toBeInTheDocument();

    // Card 2: Orçamento do mês
    expect(screen.getByText('Orçamento do mês')).toBeInTheDocument();
    expect(screen.getByText('69%')).toBeInTheDocument();
    expect(screen.getByText(/US\$ 137\.09 gasto de US\$ 200\.00 limite/i)).toBeInTheDocument();
    expect(screen.getByText(/Projeção: US\$ 258\.94/i)).toBeInTheDocument();

    // Card 3: Requisições
    expect(screen.getByText('Total de Requisições')).toBeInTheDocument();
    expect(screen.getByText(/1\.250|1,250/)).toBeInTheDocument();
    expect(screen.getByText(/34% via cache/i)).toBeInTheDocument();

    // Card 4: Economia com cache
    expect(screen.getByText('Economia com cache')).toBeInTheDocument();
    expect(screen.getByText('$18.40')).toBeInTheDocument();
    expect(screen.getByText(/respostas servidas da memória/i)).toBeInTheDocument();
  });

  it('handles upward trend for spend with semantic danger color (AC-18-Web)', () => {
    render(
      <MetricCardsGrid
        spendMicros={120_000_000}
        prevSpendMicros={100_000_000}
        projectedMonthMicros={200_000_000}
        totalRequests={500}
      />,
    );

    expect(screen.getByText('↑ 20.0%')).toBeInTheDocument();
  });

  it('displays explicit unavailable/unconfigured states when telemetry is missing (BUG-01)', () => {
    render(
      <MetricCardsGrid
        spendMicros={10_000_000}
        prevSpendMicros={10_000_000}
        projectedMonthMicros={20_000_000}
        totalRequests={100}
      />,
    );

    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Orçamento mensal não configurado')).toBeInTheDocument();
    expect(screen.getByText('chamadas roteadas')).toBeInTheDocument();
    expect(screen.getByText('telemetria de cache indisponível')).toBeInTheDocument();
    expect(screen.queryByText('$200.00')).not.toBeInTheDocument();
    expect(screen.queryByText('$18.40')).not.toBeInTheDocument();
    expect(screen.queryByText('34% via cache')).not.toBeInTheDocument();
  });

  it('renders .metric-cards-grid with exactly 4 card children for balanced 4-col or 2x2 layout (AC-SHOW-03)', () => {
    render(
      <MetricCardsGrid
        spendMicros={10_000_000}
        prevSpendMicros={10_000_000}
        projectedMonthMicros={20_000_000}
        totalRequests={100}
      />,
    );

    const grid = screen.getByTestId('metric-cards-grid');
    expect(grid).toHaveClass('metric-cards-grid');
    expect(grid.children).toHaveLength(4);
  });
});
