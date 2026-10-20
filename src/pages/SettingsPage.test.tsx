import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as auth from '../api/auth';
import * as client from '../api/client';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders settings page, saves token and clears token', async () => {
    const user = userEvent.setup();
    vi.spyOn(client, 'fetchHealth').mockResolvedValue({ status: 'ok' });

    render(<SettingsPage />);

    expect(screen.getByText('Autenticação Administrativa')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Backend e Microsserviços Online')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'new_admin_token_123');

    const saveBtn = screen.getByRole('button', { name: /salvar chave/i });
    await user.click(saveBtn);

    expect(auth.getAdminToken()).toBe('new_admin_token_123');
    expect(screen.getByText('Chave salva na sessão com sucesso.')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /limpar chave/i });
    await user.click(clearBtn);

    expect(auth.getAdminToken()).toBeNull();
    expect(screen.getByText('Chave removida da sessão.')).toBeInTheDocument();
  });

  it('shows unavailable status when health check fails', async () => {
    vi.spyOn(client, 'fetchHealth').mockRejectedValue(new Error('Connection refused'));

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Backend Indisponível ou em Dev Offline')).toBeInTheDocument();
    });
  });
});
