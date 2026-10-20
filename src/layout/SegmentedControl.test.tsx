import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl Component (AC-2A-08, AC-21 / F-05)', () => {
  const options = [
    { value: 7, label: '7 dias' },
    { value: 30, label: '30 dias' },
    { value: 90, label: '90 dias' },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all segment options and highlights active segment', () => {
    render(<SegmentedControl value={30} options={options} onChange={vi.fn()} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);

    const activeTab = screen.getByRole('tab', { name: '30 dias' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');

    const inactiveTab = screen.getByRole('tab', { name: '7 dias' });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when clicking another segment', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SegmentedControl value={30} options={options} onChange={onChange} />);

    const tab90 = screen.getByRole('tab', { name: '90 dias' });
    await user.click(tab90);

    expect(onChange).toHaveBeenCalledWith(90);
  });
});
