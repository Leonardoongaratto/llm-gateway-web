import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState Component (AC-2A-10, AC-17 / F-07)', () => {
  it('renders welcome message and interactive curl snippet', () => {
    render(<EmptyState />);

    expect(screen.getByText('Nenhum dado registrado ainda neste período')).toBeInTheDocument();
    expect(screen.getByText(/curl -X POST/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });

  it('allows copying curl snippet to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    render(<EmptyState />);

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('curl -X POST'));
    expect(screen.getByText('Copiado!')).toBeInTheDocument();
  });
});
