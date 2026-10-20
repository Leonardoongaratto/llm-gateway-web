import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetGauge } from './BudgetGauge';

describe('BudgetGauge (AC-19-Web)', () => {
  it('renders green meter when spend is below 70%', () => {
    // 60 / 100 = 60%
    render(
      <BudgetGauge spendMicros={60_000_000} budgetLimitMicros={100_000_000} projectedMicros={90_000_000} />,
    );

    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '60');
    expect(meter.dataset.colorLevel).toBe('success');

    const fillBar = meter.querySelector('.budget-gauge-fill');
    expect(fillBar).toHaveStyle({ width: '60%' });
    expect(screen.getByText(/60%/i)).toBeInTheDocument();
    expect(screen.getByText(/gasto de/i)).toBeInTheDocument();
  });

  it('renders yellow/warning meter when spend is between 70% and 89% (e.g. 71% for AC-19-Web)', () => {
    // 142 / 200 = 71%
    render(
      <BudgetGauge spendMicros={142_000_000} budgetLimitMicros={200_000_000} projectedMicros={258_941_176} />,
    );

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '71');
    expect(meter.dataset.colorLevel).toBe('warning');

    const fillBar = meter.querySelector('.budget-gauge-fill');
    expect(fillBar).toHaveStyle({ width: '71%' });
    expect(screen.getByText('71%')).toBeInTheDocument();
    expect(screen.getByText(/US\$ 142\.00 gasto de US\$ 200\.00 limite/i)).toBeInTheDocument();
    expect(screen.getByText(/Projeção: US\$ 258\.94/i)).toBeInTheDocument();
  });

  it('renders red/danger meter when spend is 90% or above', () => {
    // 95 / 100 = 95%
    render(
      <BudgetGauge spendMicros={95_000_000} budgetLimitMicros={100_000_000} projectedMicros={110_000_000} />,
    );

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '95');
    expect(meter.dataset.colorLevel).toBe('danger');

    const fillBar = meter.querySelector('.budget-gauge-fill');
    expect(fillBar).toHaveStyle({ width: '95%' });
  });

  it('caps meter bar visual width at 100% when spend exceeds budget', () => {
    // 250 / 200 = 125%
    render(<BudgetGauge spendMicros={250_000_000} budgetLimitMicros={200_000_000} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '125');
    expect(meter.dataset.colorLevel).toBe('danger');

    const fillBar = meter.querySelector('.budget-gauge-fill');
    expect(fillBar).toHaveStyle({ width: '100%' });
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('handles zero budget safely', () => {
    render(<BudgetGauge spendMicros={0} budgetLimitMicros={0} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter.dataset.colorLevel).toBe('success');
  });
});
