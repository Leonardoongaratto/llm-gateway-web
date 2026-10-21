import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetGauge } from './BudgetGauge';

describe('BudgetGauge (AC-19-Web, BUG-01)', () => {
  it('renders green meter when spend is below 70%', () => {
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
    render(<BudgetGauge spendMicros={250_000_000} budgetLimitMicros={200_000_000} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '125');
    expect(meter.dataset.colorLevel).toBe('danger');

    const fillBar = meter.querySelector('.budget-gauge-fill');
    expect(fillBar).toHaveStyle({ width: '100%' });
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('handles unconfigured or zero budget safely without inventing fake limits (BUG-01)', () => {
    render(<BudgetGauge spendMicros={10_000_000} projectedMicros={50_000_000} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuetext', 'Orçamento mensal não configurado');
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Orçamento mensal não configurado')).toBeInTheDocument();
    expect(screen.getByText(/Projeção: US\$ 50\.00/i)).toBeInTheDocument();
  });
});
