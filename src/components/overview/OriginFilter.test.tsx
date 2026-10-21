import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OriginFilter } from './OriginFilter';

describe('OriginFilter (AC-48, F-16)', () => {
  it('renders all origin options (Tudo, Gateway, Claude Code, Organização)', () => {
    render(<OriginFilter value="all" onChange={() => {}} />);

    expect(screen.getByRole('radio', { name: 'Tudo' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Gateway' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Claude Code' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Organização' })).toBeInTheDocument();
  });

  it('marks active origin as checked with aria-checked', () => {
    render(<OriginFilter value="claudecode" onChange={() => {}} />);

    const claudecodeOption = screen.getByRole('radio', { name: 'Claude Code' });
    expect(claudecodeOption).toHaveAttribute('aria-checked', 'true');

    const allOption = screen.getByRole('radio', { name: 'Tudo' });
    expect(allOption).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with selected origin on click', () => {
    const handleChange = vi.fn();
    render(<OriginFilter value="all" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Gateway' }));
    expect(handleChange).toHaveBeenCalledWith('gateway');
  });
});
