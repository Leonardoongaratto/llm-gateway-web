import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCardsGrid } from './MetricCardsGrid';

describe('MetricCardsGrid (AC-18-Web, AC-19-Web, F-08)', () => {
  it('renders all 4 KPI cards with Apple HIG layout and proper formatting', () => {
    render(
      <MetricCardsGrid
        spendMicros={137_090_585}
        prevSpendMicros={141_859_142}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
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

  it('provides zero/fallback defaults when optional cache and budget are omitted', () => {
    render(
      <MetricCardsGrid spendMicros={0} prevSpendMicros={0} projectedMonthMicros={0} totalRequests={0} />,
    );

    const zeros = screen.getAllByText('$0.00');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('0% via cache')).toBeInTheDocument();
  });
});
