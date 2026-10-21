import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartReadingPane } from './ChartReadingPane';

describe('ChartReadingPane (AC-22, AC-23, BUG-03)', () => {
  const sampleDay = {
    date: '2026-10-17',
    spend_micros: 4_347_850,
    requests: 4,
    tokens: 549_000,
    providers: [
      { provider: 'anthropic', spend_micros: 3_800_000, requests: 3 },
      { provider: 'openai', spend_micros: 547_850, requests: 1 },
    ],
  };

  it('renders selected day details with aria-live="polite" (AC-23)', () => {
    render(<ChartReadingPane selectedDay={sampleDay} />);

    const pane = screen.getByRole('status');
    expect(pane).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('17 out')).toBeInTheDocument();
    expect(screen.getByText('$4.35')).toBeInTheDocument();
    expect(screen.getByText(/4 requisições/i)).toBeInTheDocument();
  });

  it('renders provider breakdown with color indicators', () => {
    render(<ChartReadingPane selectedDay={sampleDay} />);

    expect(screen.getByText('Anthropic:')).toBeInTheDocument();
    expect(screen.getByText('$3.80')).toBeInTheDocument();
    expect(screen.getByText('OpenAI:')).toBeInTheDocument();
    expect(screen.getByText('$0.55')).toBeInTheDocument();
  });

  it('indicates estimated provider rateio when isEstimated is true (BUG-03)', () => {
    render(<ChartReadingPane selectedDay={{ ...sampleDay, isEstimated: true }} />);

    expect(screen.getByText(/rateio estimado/i)).toBeInTheDocument();
  });

  it('renders fallback when no day is selected', () => {
    render(<ChartReadingPane selectedDay={null} />);

    expect(screen.getByText(/Nenhum dia selecionado/i)).toBeInTheDocument();
  });
});
