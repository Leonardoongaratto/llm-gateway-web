import React from 'react';
import { formatPercentChange, microsToUsd } from '../../format/formatters';

export interface SummaryPhraseProps {
  periodDays: number;
  spendMicros: number;
  prevSpendMicros: number;
  projectedMonthMicros: number;
  monthlyBudgetMicros?: number;
  className?: string;
}

export const SummaryPhrase: React.FC<SummaryPhraseProps> = ({
  periodDays,
  spendMicros,
  prevSpendMicros,
  projectedMonthMicros,
  monthlyBudgetMicros = 200_000_000,
  className = '',
}) => {
  const formattedSpend = microsToUsd(spendMicros);
  const change = formatPercentChange(spendMicros, prevSpendMicros);
  const percentUsed = monthlyBudgetMicros > 0 ? Math.round((spendMicros / monthlyBudgetMicros) * 100) : 0;
  const formattedProjected = microsToUsd(projectedMonthMicros);

  const trendSymbol = change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '';
  const absFormatted = change.formatted.replace(/^[+-]/, '');

  return (
    <section
      role="region"
      aria-label="Resumo executivo do período"
      className={`summary-phrase-card ${className}`.trim()}
      style={{
        background: 'var(--hig-bg-card)',
        borderRadius: 'var(--hig-radius-lg, 12px)',
        border: '1px solid var(--hig-border)',
        boxShadow: 'var(--hig-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04))',
        padding: '16px 20px',
        fontSize: '15px',
        lineHeight: '1.5',
        color: 'var(--hig-text-primary)',
      }}
    >
      <p style={{ margin: 0 }}>
        Você gastou{' '}
        <strong className="tabular-nums" style={{ fontWeight: 600 }}>
          {formattedSpend}
        </strong>{' '}
        nos últimos {periodDays} dias (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 500,
            color:
              change.trend === 'up'
                ? 'var(--hig-danger, #ff3b30)'
                : change.trend === 'down'
                  ? 'var(--hig-success, #34c759)'
                  : 'var(--hig-text-secondary)',
          }}
        >
          {trendSymbol ? `${trendSymbol} ` : ''}
          {absFormatted}
        </span>
        ). Seu orçamento mensal está em{' '}
        <strong className="tabular-nums" style={{ fontWeight: 600 }}>
          {percentUsed}%
        </strong>{' '}
        com projeção de{' '}
        <strong className="tabular-nums" style={{ fontWeight: 600 }}>
          {formattedProjected}
        </strong>
        .
      </p>
    </section>
  );
};
