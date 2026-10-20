import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminToken } from '../api/auth';
import { AuthDialog } from './AuthDialog';

describe('AuthDialog Component (AC-2A-05 / F-03)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders dialog when isOpen is true', () => {
    render(<AuthDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Autenticação Administrativa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: lgw_admin_live_...')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthDialog isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('saves token in sessionStorage and triggers onSuccess when submitted', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'lgw_token_xyz_999');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    expect(getAdminToken()).toBe('lgw_token_xyz_999');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('prevents saving empty or whitespace token', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<AuthDialog isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, '   ');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('Por favor, informe uma chave válida.')).toBeInTheDocument();
  });
});
