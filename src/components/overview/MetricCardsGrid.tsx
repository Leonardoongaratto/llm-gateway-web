import React from 'react';
import { formatNumber, formatPercentChange, microsToUsd } from '../../format/formatters';
import { BudgetGauge } from './BudgetGauge';

export interface MetricCardsGridProps {
  spendMicros: number;
  prevSpendMicros: number;
  projectedMonthMicros: number;
  monthlyBudgetMicros?: number;
  monthSpendMicros?: number;
  totalRequests: number;
  cacheSavingsMicros?: number;
  cacheRatePercent?: number;
  className?: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  spendMicros,
  prevSpendMicros,
  projectedMonthMicros,
  monthlyBudgetMicros,
  monthSpendMicros,
  totalRequests,
  cacheSavingsMicros,
  cacheRatePercent,
  className = '',
}) => {
  const formattedSpend = microsToUsd(spendMicros);
  const change = formatPercentChange(spendMicros, prevSpendMicros);
  const trendArrow = change.trend === 'up' ? '↑ ' : change.trend === 'down' ? '↓ ' : '';
  const absChangeFormatted = change.formatted.replace(/^[+-]/, '');

  const badgeColor =
    change.trend === 'up'
      ? 'var(--hig-danger, #ff3b30)'
      : change.trend === 'down'
        ? 'var(--hig-success, #34c759)'
        : 'var(--hig-text-secondary, #86868b)';

  const badgeBg =
    change.trend === 'up'
      ? 'var(--hig-danger-subtle, rgba(255, 59, 48, 0.12))'
      : change.trend === 'down'
        ? 'var(--hig-success-subtle, rgba(52, 199, 89, 0.12))'
        : 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.12))';

  const cardStyle: React.CSSProperties = {
    background: 'var(--hig-bg-card)',
    borderRadius: 'var(--hig-radius-lg, 12px)',
    border: '1px solid var(--hig-border)',
    boxShadow: 'var(--hig-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04))',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--hig-text-secondary)',
    marginBottom: '8px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--hig-text-primary)',
    lineHeight: 1.15,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--hig-text-secondary)',
    marginTop: '8px',
  };

  return (
    <div className={`metric-cards-grid ${className}`.trim()} data-testid="metric-cards-grid">
      <div style={cardStyle} data-testid="metric-card-spend">
        <div>
          <div style={labelStyle}>Gasto no período</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <span className="tabular-nums" style={valueStyle}>
              {formattedSpend}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: badgeColor,
                background: badgeBg,
                padding: '2px 8px',
                borderRadius: 'var(--hig-radius-full, 9999px)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {trendArrow}
              {absChangeFormatted}
            </span>
          </div>
        </div>
        <div style={subtextStyle}>vs. período anterior</div>
      </div>

      <div style={cardStyle} data-testid="metric-card-budget">
        <div style={labelStyle}>Orçamento do mês</div>
        <BudgetGauge
          spendMicros={monthSpendMicros ?? spendMicros}
          budgetLimitMicros={monthlyBudgetMicros}
          projectedMicros={projectedMonthMicros}
        />
      </div>

      <div style={cardStyle} data-testid="metric-card-requests">
        <div>
          <div style={labelStyle}>Total de Requisições</div>
          <div className="tabular-nums" style={valueStyle}>
            {formatNumber(totalRequests)}
          </div>
        </div>
        <div style={subtextStyle}>
          {typeof cacheRatePercent === 'number' ? (
            <span
              className="tabular-nums"
              style={{
                fontWeight: 500,
                color: 'var(--hig-text-primary)',
              }}
            >
              {cacheRatePercent}% via cache
            </span>
          ) : (
            <span>chamadas roteadas</span>
          )}
        </div>
      </div>

      <div style={cardStyle} data-testid="metric-card-cache-savings">
        <div>
          <div style={labelStyle}>Economia com cache</div>
          <div className="tabular-nums" style={valueStyle}>
            {typeof cacheSavingsMicros === 'number' ? microsToUsd(cacheSavingsMicros) : '—'}
          </div>
        </div>
        <div style={subtextStyle}>
          {typeof cacheSavingsMicros === 'number'
            ? 'respostas servidas da memória'
            : 'telemetria de cache indisponível'}
        </div>
      </div>
    </div>
  );
};
