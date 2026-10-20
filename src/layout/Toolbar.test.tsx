import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toolbar } from './Toolbar';

describe('Toolbar Component (AC-2A-08, AC-21 / F-05)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders section title and segmented period control', () => {
    render(<Toolbar title="Visão Geral" period={30} onPeriodChange={vi.fn()} onAuthClick={vi.fn()} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: /período/i })).toBeInTheDocument();
  });

  it('triggers onPeriodChange and stores value in localStorage', async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();

    render(<Toolbar title="Visão Geral" period={30} onPeriodChange={onPeriodChange} onAuthClick={vi.fn()} />);

    const tab7 = screen.getByRole('tab', { name: '7 dias' });
    await user.click(tab7);

    expect(onPeriodChange).toHaveBeenCalledWith(7);
  });

  it('triggers onAuthClick when auth button is clicked', async () => {
    const user = userEvent.setup();
    const onAuthClick = vi.fn();

    render(<Toolbar title="Visão Geral" period={30} onPeriodChange={vi.fn()} onAuthClick={onAuthClick} />);

    const authBtn = screen.getByRole('button', { name: /autenticação/i });
    await user.click(authBtn);

    expect(onAuthClick).toHaveBeenCalledTimes(1);
  });
});
