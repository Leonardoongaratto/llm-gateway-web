import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component (AC-24)', () => {
  it('renders label and default icon for success variant', () => {
    render(<StatusBadge variant="success" label="Operando" />);
    expect(screen.getByText('Operando')).toBeInTheDocument();
    const badge = screen.getByText('Operando').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'success');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders label and default icon for warning variant', () => {
    render(<StatusBadge variant="warning" label="Perto do limite" />);
    expect(screen.getByText('Perto do limite')).toBeInTheDocument();
    const badge = screen.getByText('Perto do limite').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'warning');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders label and default icon for danger variant', () => {
    render(<StatusBadge variant="danger" label="Bloqueado" />);
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    const badge = screen.getByText('Bloqueado').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'danger');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders label and default icon for info variant', () => {
    render(<StatusBadge variant="info" label="Uso" />);
    expect(screen.getByText('Uso')).toBeInTheDocument();
    const badge = screen.getByText('Uso').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'info');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders label and default icon for neutral variant', () => {
    render(<StatusBadge variant="neutral" label="Configuração" />);
    expect(screen.getByText('Configuração')).toBeInTheDocument();
    const badge = screen.getByText('Configuração').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'neutral');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders label and default icon for fallback variant', () => {
    render(<StatusBadge variant="fallback" label="Fallback" />);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    const badge = screen.getByText('Fallback').closest('.hig-status-badge');
    expect(badge).toHaveAttribute('data-variant', 'fallback');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('allows custom icon override and custom className', () => {
    render(
      <StatusBadge
        variant="info"
        label="Custom"
        className="custom-class"
        icon={<span data-testid="custom-icon">*</span>}
      />,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    const badge = screen.getByText('Custom').closest('.hig-status-badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('sets aria-hidden="true" on default svg icon for accessibility', () => {
    const { container } = render(<StatusBadge variant="success" label="Normal" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
