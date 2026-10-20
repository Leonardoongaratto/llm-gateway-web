import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { triggerAuthRequired } from '../api/auth';
import { AppLayout } from './AppLayout';

describe('AppLayout Component (AC-2A-07, AC-2A-08, AC-21 / F-05)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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

  it('opens AuthDialog when onAuthRequired is triggered', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout>
          <div>Conteúdo</div>
        </AppLayout>
      </MemoryRouter>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      triggerAuthRequired();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
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
