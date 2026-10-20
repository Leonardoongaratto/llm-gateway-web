import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar Component (AC-2A-07 / F-05)', () => {
  it('renders all 5 primary navigation links with active highlight on selected route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar activePath="/dashboard" onNavigate={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Menu Principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visão geral/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projetos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /provedores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /eventos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ajustes/i })).toBeInTheDocument();

    const overviewLink = screen.getByRole('link', { name: /visão geral/i });
    expect(overviewLink).toHaveAttribute('aria-current', 'page');

    const projectsLink = screen.getByRole('link', { name: /projetos/i });
    expect(projectsLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('triggers onNavigate callback when link is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar activePath="/dashboard" onNavigate={onNavigate} />
      </MemoryRouter>,
    );

    const projectsLink = screen.getByRole('link', { name: /projetos/i });
    await user.click(projectsLink);

    expect(onNavigate).toHaveBeenCalledWith('/dashboard/projetos');
  });
});
