import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminToken } from '../api/auth';
import { AuthDialog } from './AuthDialog';

describe('AuthDialog Component (AC-2A-05 / F-03)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
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

  it('saves token in sessionStorage and triggers onSuccess when valid', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true }));

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'lgw_token_xyz_999');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(getAdminToken()).toBe('lgw_token_xyz_999');
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error and does not save token when backend returns 401', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }));

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'invalid_token');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Chave inválida ou não autorizada pelo servidor.')).toBeInTheDocument();
      expect(getAdminToken()).toBeNull();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes dialog on Escape key press', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);

    await user.keyboard('{Escape}');

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

  it('displays error and does not save token on network failure (fail-closed)', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    render(<AuthDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'test_token');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível validar, servidor indisponível.')).toBeInTheDocument();
      expect(getAdminToken()).toBeNull();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('traps focus inside the dialog with Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<AuthDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    const submitBtn = screen.getByRole('button', { name: /salvar/i });

    expect(document.activeElement).toBe(input);

    // Shift+Tab from first element (input) wraps to last element (submit button)
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(submitBtn);

    // Tab from last element (submit button) wraps to first element (input)
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(input);

    // Normal Tab moves to cancel button
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(cancelBtn);
  });

  it('restores focus to previous active element when unmounted', () => {
    const triggerBtn = document.createElement('button');
    triggerBtn.textContent = 'Open Dialog';
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    const { unmount } = render(<AuthDialog isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(document.activeElement).not.toBe(triggerBtn);

    unmount();
    expect(document.activeElement).toBe(triggerBtn);
    document.body.removeChild(triggerBtn);
  });
});
