import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryPhrase } from './SummaryPhrase';

describe('SummaryPhrase (AC-18-Web, AC-19-Web)', () => {
  it('renders dynamic summary phrase with spend, period, variation, budget % and projection', () => {
    // spend_micros: 137090585 ($137.09)
    // prev_spend_micros: 141859142 ($141.86 -> -3.4%)
    // projected_month_micros: 258941176 ($258.94)
    // monthly_budget_micros: 200000000 ($200.00 -> 71% of $142 spend or 69% of $137.09)
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={142000000}
        prevSpendMicros={147000000}
        projectedMonthMicros={258941176}
        monthlyBudgetMicros={200000000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain('Você gastou $142.00 nos últimos 30 dias');
    expect(banner.textContent).toContain('Seu orçamento mensal está em 71% com projeção de $258.94');
  });

  it('exhibits increase with upward trend indicator for AC-18-Web', () => {
    // 120 vs 100 -> +20.0%
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={120000000}
        prevSpendMicros={100000000}
        projectedMonthMicros={240000000}
        monthlyBudgetMicros={200000000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('↑');
    expect(banner.textContent).toContain('20.0%');
  });

  it('exhibits decrease with downward trend indicator for AC-18-Web', () => {
    // 137.09 vs 141.86 -> -3.4%
    render(
      <SummaryPhrase
        periodDays={30}
        spendMicros={137090585}
        prevSpendMicros={141859142}
        projectedMonthMicros={258941176}
        monthlyBudgetMicros={200000000}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('↓');
    expect(banner.textContent).toContain('3.4%');
  });

  it('uses default 200 USD monthly budget if not specified', () => {
    render(
      <SummaryPhrase
        periodDays={7}
        spendMicros={142000000}
        prevSpendMicros={142000000}
        projectedMonthMicros={258941176}
      />,
    );

    const banner = screen.getByRole('region', { name: /resumo executivo do período/i });
    expect(banner.textContent).toContain('Você gastou $142.00 nos últimos 7 dias');
    expect(banner.textContent).toContain('Seu orçamento mensal está em 71%');
  });
});
