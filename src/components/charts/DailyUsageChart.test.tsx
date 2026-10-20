import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DailyUsageChart } from './DailyUsageChart';

describe('DailyUsageChart (AC-21, AC-22, AC-23, F-09, F-10)', () => {
  const sampleDailyData = [
    {
      date: '2026-10-15',
      spend_micros: 3_000_000,
      requests: 10,
      tokens: 400_000,
      by_provider: [
        { provider: 'anthropic', spend_micros: 2_000_000, requests: 6, tokens: 250_000 },
        { provider: 'openai', spend_micros: 1_000_000, requests: 4, tokens: 150_000 },
      ],
    },
    {
      date: '2026-10-16',
      spend_micros: 5_000_000,
      requests: 15,
      tokens: 600_000,
      by_provider: [
        { provider: 'anthropic', spend_micros: 3_000_000, requests: 10, tokens: 400_000 },
        { provider: 'openai', spend_micros: 1_500_000, requests: 4, tokens: 150_000 },
        { provider: 'gemini', spend_micros: 500_000, requests: 1, tokens: 50_000 },
      ],
    },
    {
      date: '2026-10-17',
      spend_micros: 4_000_000,
      requests: 12,
      tokens: 500_000,
      by_provider: [
        { provider: 'anthropic', spend_micros: 2_500_000, requests: 8, tokens: 350_000 },
        { provider: 'openai', spend_micros: 1_500_000, requests: 4, tokens: 150_000 },
      ],
    },
  ];

  it('renders region with accessible label, SVG patterns and right Y-axis (AC-23, F-09)', () => {
    const { container } = render(<DailyUsageChart data={sampleDailyData} periodDays={30} />);

    const region = screen.getByRole('region', { name: /gráfico diário de consumo/i });
    expect(region).toBeInTheDocument();

    // Check SVG patterns
    expect(container.querySelector('#pattern-anthropic-hatch')).toBeInTheDocument();
    expect(container.querySelector('#pattern-openai-dots')).toBeInTheDocument();
    expect(container.querySelector('#pattern-gemini-smooth')).toBeInTheDocument();

    // Check grid lines (at least 3 horizontal lines)
    const gridLines = container.querySelectorAll('.chart-grid-line');
    expect(gridLines.length).toBeGreaterThanOrEqual(3);

    // Check right Y-axis labels
    const yAxisLabels = container.querySelectorAll('.chart-y-axis-label');
    expect(yAxisLabels.length).toBeGreaterThanOrEqual(3);
  });

  it('renders structured hidden table for screen readers (AC-23)', () => {
    const { container } = render(<DailyUsageChart data={sampleDailyData} periodDays={30} />);

    const table = container.querySelector('table.sr-only');
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent(/Data/i);
    expect(table).toHaveTextContent(/Anthropic/i);
    expect(table).toHaveTextContent(/OpenAI/i);
    expect(table).toHaveTextContent(/Gemini/i);
    expect(table).toHaveTextContent(/Requisições/i);
    expect(table).toHaveTextContent('2026-10-17');
  });

  it('navigates through days using keyboard (ArrowLeft, ArrowRight, Home, End) and updates reading pane (AC-22)', () => {
    render(<DailyUsageChart data={sampleDailyData} periodDays={30} />);

    const interactiveArea = screen.getByRole('application', { name: /gráfico interativo de barras/i });
    interactiveArea.focus();

    const getPane = () => within(screen.getByRole('status'));

    // Default selection is the last day (2026-10-17)
    expect(getPane().getByText('17 out')).toBeInTheDocument();
    expect(getPane().getByText('$4.00')).toBeInTheDocument();

    // Press ArrowLeft to go to 2026-10-16
    fireEvent.keyDown(interactiveArea, { key: 'ArrowLeft' });
    expect(getPane().getByText('16 out')).toBeInTheDocument();
    expect(getPane().getByText('$5.00')).toBeInTheDocument();

    // Press Home to jump to first day (2026-10-15)
    fireEvent.keyDown(interactiveArea, { key: 'Home' });
    expect(getPane().getByText('15 out')).toBeInTheDocument();
    expect(getPane().getByText('$3.00')).toBeInTheDocument();

    // Press ArrowRight to move forward (2026-10-16)
    fireEvent.keyDown(interactiveArea, { key: 'ArrowRight' });
    expect(getPane().getByText('16 out')).toBeInTheDocument();

    // Press End to jump to last day (2026-10-17)
    fireEvent.keyDown(interactiveArea, { key: 'End' });
    expect(getPane().getByText('17 out')).toBeInTheDocument();
  });

  it('updates selection on mouse click on a bar', () => {
    const { container } = render(<DailyUsageChart data={sampleDailyData} periodDays={30} />);

    const dayBars = container.querySelectorAll('.chart-day-bar-group');
    expect(dayBars.length).toBe(3);

    const getPane = () => within(screen.getByRole('status'));

    // Click on the first bar (2026-10-15)
    fireEvent.click(dayBars[0]!);
    expect(getPane().getByText('15 out')).toBeInTheDocument();
    expect(getPane().getByText('$3.00')).toBeInTheDocument();
  });

  it('calculates provider breakdown proportionally if daily item lacks explicit by_provider', () => {
    const implicitData = [
      {
        date: '2026-10-10',
        spend_micros: 10_000_000,
        requests: 20,
        tokens: 800_000,
      },
    ];

    const providerSummary = [
      { provider: 'anthropic', spend_micros: 8_000_000 },
      { provider: 'openai', spend_micros: 2_000_000 },
    ];

    render(<DailyUsageChart data={implicitData} periodDays={30} providerSummary={providerSummary} />);

    const pane = within(screen.getByRole('status'));
    expect(pane.getByText('10 out')).toBeInTheDocument();
    expect(pane.getByText('$10.00')).toBeInTheDocument();
    expect(pane.getByText('$8.00')).toBeInTheDocument();
    expect(pane.getByText('$2.00')).toBeInTheDocument();
  });
});
