import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminToken, triggerAuthRequired } from '../api/auth';
import { AppLayout, usePeriod } from './AppLayout';

const TestChild = () => {
  const { refreshKey } = usePeriod();
  return <div data-testid="refresh-counter">Refresh: {refreshKey}</div>;
};

describe('AppLayout Component (AC-2A-07, AC-2A-08, AC-21 / F-05)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders layout shell with persistent period from localStorage', async () => {
    localStorage.setItem('lgw_period_days', '90');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout>
          <div>Conteúdo Principal</div>
        </AppLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText('Conteúdo Principal')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '90 dias' })).toHaveAttribute('aria-selected', 'true');
  });

  it('persists period changes into localStorage and updates state', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout>
          <div>Conteúdo</div>
        </AppLayout>
      </MemoryRouter>,
    );

    const tab7 = screen.getByRole('tab', { name: '7 dias' });
    await user.click(tab7);

    expect(tab7).toHaveAttribute('aria-selected', 'true');
    expect(localStorage.getItem('lgw_period_days')).toBe('7');
  });

  it('opens AuthDialog on 401, saves valid token and triggers refresh on success', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true }));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout>
          <TestChild />
        </AppLayout>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('refresh-counter')).toHaveTextContent('Refresh: 0');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      triggerAuthRequired();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Ex: lgw_admin_live_...');
    await user.type(input, 'lgw_token_refetch_test');

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(getAdminToken()).toBe('lgw_token_refetch_test');
      expect(screen.getByTestId('refresh-counter')).toHaveTextContent('Refresh: 1');
    });
  });

  it('updates title dynamically based on current route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/projetos']}>
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <AppLayout>
                <div>Projetos View</div>
              </AppLayout>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Projetos e Chaves')).toBeInTheDocument();
  });
});
