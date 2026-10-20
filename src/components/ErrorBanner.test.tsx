import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner Component (AC-2A-10 / F-07)', () => {
  it('renders error message with alert role and status code', () => {
    render(<ErrorBanner message="Falha de conexão com o Edge" status={503} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Falha de conexão com o Edge')).toBeInTheDocument();
    expect(screen.getByText('Erro 503')).toBeInTheDocument();
  });

  it('triggers onRetry callback when reload button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorBanner message="Backend offline" onRetry={onRetry} />);

    const retryBtn = screen.getByRole('button', { name: /tentar de novo/i });
    await user.click(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
