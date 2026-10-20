import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModelShareBars } from './ModelShareBars';

describe('ModelShareBars (AC-20, F-11)', () => {
  const sampleModels = [
    {
      model: 'gpt-4o',
      spend_micros: 15_210_317,
      requests: 31,
      tokens: 4_293_810,
    },
    {
      model: 'claude-3-opus-20240229',
      spend_micros: 101_325_690,
      requests: 31,
      tokens: 4_340_310,
    },
    {
      model: 'gpt-4o-mini',
      spend_micros: 940_461,
      requests: 31,
      tokens: 4_386_810,
    },
    {
      model: 'claude-3-5-sonnet-20241022',
      spend_micros: 19_614_117,
      requests: 31,
      tokens: 4_247_310,
    },
  ];

  it('renders horizontal bars ordered descending by cost (AC-20)', () => {
    const { container } = render(<ModelShareBars models={sampleModels} />);

    const modelNames = container.querySelectorAll('.model-share-name');
    expect(modelNames.length).toBe(4);

    // Order must be Opus, Sonnet, GPT-4o, GPT-4o-mini
    expect(modelNames[0]).toHaveTextContent('claude-3-opus-20240229');
    expect(modelNames[1]).toHaveTextContent('claude-3-5-sonnet-20241022');
    expect(modelNames[2]).toHaveTextContent('gpt-4o');
    expect(modelNames[3]).toHaveTextContent('gpt-4o-mini');
  });

  it('guarantees percentages sum to 100% ± 0.1% (AC-20)', () => {
    const { container } = render(<ModelShareBars models={sampleModels} />);

    const percentElements = container.querySelectorAll('.model-share-percent');
    let sum = 0;
    percentElements.forEach((el) => {
      const val = parseFloat(el.textContent?.replace('%', '') ?? '0');
      sum += val;
    });

    expect(Math.abs(sum - 100.0)).toBeLessThanOrEqual(0.1);
  });

  it('displays formatted spend, requests, and tokens for each model', () => {
    render(<ModelShareBars models={sampleModels} />);

    // Check Opus row values
    expect(screen.getByText('claude-3-opus-20240229')).toBeInTheDocument();
    expect(screen.getByText('$101.33')).toBeInTheDocument();
    expect(screen.getAllByText(/31 reqs/i).length).toBe(4);
    expect(screen.getByText(/4\.340\.310 tokens|4,340,310 tokens/i)).toBeInTheDocument();
  });

  it('handles empty models list gracefully', () => {
    render(<ModelShareBars models={[]} />);

    expect(screen.getByText(/Nenhum dado de modelo disponível/i)).toBeInTheDocument();
  });

  it('assigns specific provider colors to Gemini and other models', () => {
    const mixedModels = [
      { model: 'gemini-1.5-pro', spend_micros: 5_000_000, requests: 10, tokens: 100_000 },
      { model: 'mistral-large', spend_micros: 2_000_000, requests: 5, tokens: 50_000 },
    ];

    render(<ModelShareBars models={mixedModels} />);
    expect(screen.getByText('gemini-1.5-pro')).toBeInTheDocument();
    expect(screen.getByText('mistral-large')).toBeInTheDocument();
  });
});
