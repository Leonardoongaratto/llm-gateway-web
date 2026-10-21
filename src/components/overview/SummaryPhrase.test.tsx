import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryPhrase } from './SummaryPhrase';

describe('SummaryPhrase (AC-18-Web, AC-19-Web, BUG-01, BUG-04)', () => {
  it('renders dynamic summary phrase with spend, period, variation, budget % and projection', () => {
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={142_000_000}
        prevSpendMicros={147_000_000}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
        monthSpendMicros={142_000_000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain('Você gastou $142.00 nos últimos 30 dias');
    expect(banner.textContent).toContain('Seu orçamento mensal está em 71% com projeção de $258.94');
  });

  it('exhibits increase with upward trend indicator for AC-18-Web', () => {
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={120_000_000}
        prevSpendMicros={100_000_000}
        projectedMonthMicros={240_000_000}
        monthlyBudgetMicros={200_000_000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('↑');
    expect(banner.textContent).toContain('20.0%');
  });

  it('exhibits decrease with downward trend indicator for AC-18-Web', () => {
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={137_090_585}
        prevSpendMicros={141_859_142}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('↓');
    expect(banner.textContent).toContain('3.4%');
  });

  it('handles unconfigured monthly budget gracefully without inventing fake numbers (BUG-01)', () => {
    render(
      <SummaryPhrase
        periodDays={7}
        spendMicros={142_000_000}
        prevSpendMicros={142_000_000}
        projectedMonthMicros={258_941_176}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('Você gastou $142.00 nos últimos 7 dias');
    expect(banner.textContent).toContain('Projeção de fechamento do mês em $258.94');
    expect(banner.textContent).toContain('orçamento não configurado');
    expect(banner.textContent).not.toContain('$200.00');
  });

  it('keeps monthly budget % invariant to periodDays when monthSpendMicros is provided (BUG-04)', () => {
    const { rerender } = render(
      <SummaryPhrase
        periodDays={7}
        spendMicros={30_000_000}
        prevSpendMicros={28_000_000}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
        monthSpendMicros={142_000_000}
      />,
    );

    let banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('Seu orçamento mensal está em 71%');

    // Changing periodDays to 90 still preserves 71% month budget
    rerender(
      <SummaryPhrase
        periodDays={90}
        spendMicros={400_000_000}
        prevSpendMicros={380_000_000}
        projectedMonthMicros={258_941_176}
        monthlyBudgetMicros={200_000_000}
        monthSpendMicros={142_000_000}
      />,
    );

    banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('Seu orçamento mensal está em 71%');
  });
});
