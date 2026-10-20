import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionsCard } from './SubscriptionsCard';

describe('SubscriptionsCard (AC-48, F-16)', () => {
  const sampleSubscriptions = [
    {
      id: 'sub-1',
      name: 'Claude Code Pro',
      provider: 'anthropic',
      monthly_cost_micros: 20_000_000,
      equivalent_value_micros: 84_000_000,
      aproveitamento: 4.2,
    },
    {
      id: 'sub-2',
      name: 'Gemini Advanced',
      provider: 'gemini',
      monthly_cost_micros: 20_000_000,
      equivalent_value_micros: 0,
      aproveitamento: 0,
    },
  ];

  it('renders subscriptions with cost and multiplier ("rendeu 4.2×")', () => {
    render(<SubscriptionsCard subscriptions={sampleSubscriptions} />);

    expect(screen.getByText('Claude Code Pro')).toBeInTheDocument();
    expect(screen.getAllByText('$20.00 / mês').length).toBe(2);
    expect(screen.getByText('$84.00')).toBeInTheDocument();
    expect(screen.getByText(/rendeu 4[.,]2×/i)).toBeInTheDocument();
  });

  it('renders "estimado" badge with explanation tooltip or popover (AC-48)', () => {
    render(<SubscriptionsCard subscriptions={sampleSubscriptions} />);

    const badge = screen.getByText(/estimado/i);
    expect(badge).toBeInTheDocument();

    // Hovering shows explanation and unhovering hides
    fireEvent.mouseEnter(badge);
    expect(screen.getByText(/valor que essas mensagens custariam na API/i)).toBeInTheDocument();
    fireEvent.mouseLeave(badge);

    // Clicking toggles explanation
    fireEvent.click(badge);
    expect(screen.getByText(/valor que essas mensagens custariam na API/i)).toBeInTheDocument();
  });

  it('displays warning note for provider without telemetry (e.g. Gemini) (AC-48)', () => {
    render(<SubscriptionsCard subscriptions={sampleSubscriptions} />);

    expect(screen.getByText('Gemini Advanced')).toBeInTheDocument();
    expect(screen.getByText(/consumo não disponível para este provedor/i)).toBeInTheDocument();
  });

  it('handles empty subscriptions gracefully', () => {
    render(<SubscriptionsCard subscriptions={[]} />);

    expect(screen.getByText(/Nenhuma assinatura ativa/i)).toBeInTheDocument();
  });
});
