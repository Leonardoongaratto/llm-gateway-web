import React from 'react';
import { microsToUsd } from '../../format/formatters';

export interface BudgetGaugeProps {
  spendMicros: number;
  budgetLimitMicros?: number;
  projectedMicros?: number;
  className?: string;
}

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({
  spendMicros,
  budgetLimitMicros,
  projectedMicros,
  className = '',
}) => {
  const hasBudget = typeof budgetLimitMicros === 'number' && budgetLimitMicros > 0;
  const percentUsed = hasBudget ? Math.round((spendMicros / budgetLimitMicros) * 100) : null;
  const clampedWidth = percentUsed !== null ? Math.min(Math.max(percentUsed, 0), 100) : 0;

  let colorLevel: 'success' | 'warning' | 'danger' = 'success';
  let fillColor = 'var(--hig-success, #34c759)';

  if (percentUsed !== null) {
    if (percentUsed >= 90) {
      colorLevel = 'danger';
      fillColor = 'var(--hig-danger, #ff3b30)';
    } else if (percentUsed >= 70) {
      colorLevel = 'warning';
      fillColor = 'var(--hig-warning, #ff9500)';
    }
  }

  const spendFormatted = microsToUsd(spendMicros).replace('$', '');
  const limitFormatted = hasBudget ? microsToUsd(budgetLimitMicros).replace('$', '') : null;
  const projectedFormatted =
    projectedMicros !== undefined ? microsToUsd(projectedMicros).replace('$', '') : null;

  return (
    <div className={`budget-gauge-container ${className}`.trim()} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '6px',
        }}
      >
        <span
          className="tabular-nums"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--hig-text-primary)',
          }}
        >
          {percentUsed !== null ? `${percentUsed}%` : '—'}
        </span>
      </div>

      <div
        role="meter"
        aria-valuenow={percentUsed ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={
          percentUsed !== null
            ? `${percentUsed}% do orçamento mensal consumido`
            : 'Orçamento mensal não configurado'
        }
        data-color-level={colorLevel}
        style={{
          position: 'relative',
          width: '100%',
          height: '8px',
          background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.16))',
          borderRadius: 'var(--hig-radius-full, 9999px)',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          className="budget-gauge-fill"
          style={{
            width: `${clampedWidth}%`,
            height: '100%',
            background: hasBudget ? fillColor : 'transparent',
            borderRadius: 'var(--hig-radius-full, 9999px)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          fontSize: '12px',
          color: 'var(--hig-text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {hasBudget ? (
          <span className="tabular-nums">
            US$ {spendFormatted} gasto de US$ {limitFormatted} limite
          </span>
        ) : (
          <span>Orçamento mensal não configurado</span>
        )}
        {projectedFormatted && (
          <span className="tabular-nums" style={{ color: 'var(--hig-text-tertiary, #86868b)' }}>
            Projeção: US$ {projectedFormatted}
          </span>
        )}
      </div>
    </div>
  );
};
