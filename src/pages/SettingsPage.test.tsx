import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as auth from '../api/auth';
import * as client from '../api/client';
import * as layout from '../layout/AppLayout';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders settings page, saves valid token and clears token with triggerRefresh', async () => {
    const user = userEvent.setup();
    const triggerRefreshMock = vi.fn();
    vi.spyOn(client, 'fetchHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(client, 'validateAdminToken').mockResolvedValue(true);
    vi.spyOn(layout, 'usePeriod').mockReturnValue({
      period: 30,
      setPeriod: vi.fn(),
      refreshKey: 0,
      triggerRefresh: triggerRefreshMock,
    });

    render(<SettingsPage />);

    expect(screen.getByText('Autenticação Administrativa')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Backend e Microsserviços Online')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'new_admin_token_123');

    const saveBtn = screen.getByRole('button', { name: /salvar chave/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(auth.getAdminToken()).toBe('new_admin_token_123');
      expect(screen.getByText('Chave salva na sessão com sucesso.')).toBeInTheDocument();
      expect(triggerRefreshMock).toHaveBeenCalledTimes(1);
    });

    const clearBtn = screen.getByRole('button', { name: /limpar chave/i });
    await user.click(clearBtn);

    expect(auth.getAdminToken()).toBeNull();
    expect(screen.getByText('Chave removida da sessão.')).toBeInTheDocument();
    expect(triggerRefreshMock).toHaveBeenCalledTimes(2);
  });

  it('displays error and does not save when token is invalid', async () => {
    const user = userEvent.setup();
    vi.spyOn(client, 'fetchHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(client, 'validateAdminToken').mockResolvedValue(false);

    render(<SettingsPage />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'bad_token');

    const saveBtn = screen.getByRole('button', { name: /salvar chave/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Chave inválida ou não autorizada pelo servidor.')).toBeInTheDocument();
      expect(auth.getAdminToken()).toBeNull();
    });
  });

  it('displays error and does not save on network failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(client, 'fetchHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(client, 'validateAdminToken').mockRejectedValue(new Error('Network error'));

    render(<SettingsPage />);

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'offline_token');

    const saveBtn = screen.getByRole('button', { name: /salvar chave/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível validar, servidor indisponível.')).toBeInTheDocument();
      expect(auth.getAdminToken()).toBeNull();
    });
  });

  it('shows unavailable status when health check fails', async () => {
    vi.spyOn(client, 'fetchHealth').mockRejectedValue(new Error('Connection refused'));

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Backend Indisponível ou em Dev Offline')).toBeInTheDocument();
    });
  });
});
