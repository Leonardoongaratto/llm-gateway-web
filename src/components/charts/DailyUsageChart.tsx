import React, { useId, useState } from 'react';
import { formatDateShort, formatNumber, microsToUsd } from '../../format/formatters';
import { ChartReadingPane, SelectedDayInfo } from './ChartReadingPane';

export interface DailyUsageChartItem {
  date: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  by_provider?: { provider: string; spend_micros: number; requests?: number; tokens?: number }[];
}

export interface ProviderSummaryItem {
  provider: string;
  spend_micros: number;
}

export interface DailyUsageChartProps {
  data: DailyUsageChartItem[];
  periodDays: number;
  providerSummary?: ProviderSummaryItem[];
  className?: string;
  onSelectDay?: (day: DailyUsageChartItem, index: number) => void;
}

export const DailyUsageChart: React.FC<DailyUsageChartProps> = ({
  data,
  periodDays,
  providerSummary,
  className = '',
  onSelectDay,
}) => {
  const baseId = useId().replace(/:/g, '');
  const descId = `${baseId}-chart-desc`;
  const hatchId = `${baseId}-hatch`;
  const dotsId = `${baseId}-dots`;
  const smoothId = `${baseId}-smooth`;

  const [selectedIndex, setSelectedIndex] = useState<number>(data.length > 0 ? data.length - 1 : 0);
  const activeIndex = data.length > 0 ? Math.min(Math.max(selectedIndex, 0), data.length - 1) : 0;

  if (!data || data.length === 0) {
    return (
      <section
        role="region"
        aria-label={`Gráfico de barras empilhadas de consumo diário dos últimos ${periodDays} dias`}
        className={`daily-usage-chart ${className}`.trim()}
        style={{
          background: 'var(--hig-bg-card)',
          borderRadius: 'var(--hig-radius-lg, 12px)',
          border: '1px solid var(--hig-border)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--hig-text-secondary)',
        }}
      >
        <p>Nenhum dado de consumo disponível no período selecionado.</p>
      </section>
    );
  }

  const getDayProviders = (item: DailyUsageChartItem) => {
    if (item.by_provider && item.by_provider.length > 0) {
      return {
        providers: item.by_provider.map((p) => ({
          provider: p.provider.toLowerCase(),
          spend_micros: p.spend_micros,
          requests: p.requests ?? 0,
        })),
        isEstimated: false,
      };
    }

    if (providerSummary && providerSummary.length > 0) {
      const totalSummarySpend = providerSummary.reduce((acc, p) => acc + p.spend_micros, 0);
      if (totalSummarySpend > 0) {
        return {
          providers: providerSummary.map((p) => {
            const ratio = p.spend_micros / totalSummarySpend;
            const share = Math.round(item.spend_micros * ratio);
            return {
              provider: p.provider.toLowerCase(),
              spend_micros: share,
              requests: Math.round(item.requests * ratio),
            };
          }),
          isEstimated: true,
        };
      }
    }

    return {
      providers: [
        {
          provider: 'total',
          spend_micros: item.spend_micros,
          requests: item.requests,
        },
      ],
      isEstimated: false,
    };
  };

  const selectedItem = data[activeIndex] ?? data[data.length - 1]!;
  const dayResolved = getDayProviders(selectedItem);
  const selectedDayInfo: SelectedDayInfo = {
    date: selectedItem.date,
    spend_micros: selectedItem.spend_micros,
    requests: selectedItem.requests,
    tokens: selectedItem.tokens,
    isEstimated: dayResolved.isEstimated,
    providers: dayResolved.providers,
  };

  const handleSelectIndex = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    setSelectedIndex(clamped);
    if (data[clamped]) {
      onSelectDay?.(data[clamped]!, clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSelectIndex(activeIndex - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSelectIndex(activeIndex + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleSelectIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      handleSelectIndex(data.length - 1);
    }
  };

  const svgWidth = 800;
  const svgHeight = 260;
  const marginLeft = 16;
  const marginRight = 68;
  const marginTop = 20;
  const marginBottom = 36;
  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const maxSpend = Math.max(...data.map((d) => d.spend_micros), 1_000_000);
  const midSpend = Math.round(maxSpend / 2);

  const barStep = chartWidth / data.length;
  const barWidth = Math.max(Math.min(barStep * 0.72, 28), 6);
  const labelInterval = data.length > 30 ? 5 : data.length > 14 ? 3 : 1;

  const startDateFormatted = formatDateShort(data[0]?.date ?? '');
  const endDateFormatted = formatDateShort(data[data.length - 1]?.date ?? '');

  return (
    <section
      role="region"
      aria-label={`Gráfico de barras empilhadas de consumo diário dos últimos ${periodDays} dias`}
      aria-describedby={descId}
      className={`daily-usage-chart-card ${className}`.trim()}
      style={{
        background: 'var(--hig-bg-card)',
        borderRadius: 'var(--hig-radius-lg, 12px)',
        border: '1px solid var(--hig-border)',
        boxShadow: 'var(--hig-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04))',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        outline: 'none',
      }}
    >
      <p id={descId} className="sr-only">
        Gráfico de barras empilhadas de consumo diário para {periodDays} dias ({startDateFormatted} a{' '}
        {endDateFormatted}). Eixo Y de $0.00 a {microsToUsd(maxSpend)}.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--hig-text-primary)',
          }}
        >
          Consumo Diário por Provedor
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
          {periodDays} dias selecionados
        </span>
      </div>

      <ChartReadingPane selectedDay={selectedDayInfo} />

      <div
        role="application"
        tabIndex={0}
        aria-label="Gráfico interativo de barras de consumo diário. Use as setas para navegar entre os dias."
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          borderRadius: 'var(--hig-radius-md, 8px)',
          outline: 'none',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            height: 'auto',
            minHeight: '220px',
            display: 'block',
          }}
        >
          <defs>
            <pattern
              id={hatchId}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
            </pattern>

            <pattern id={dotsId} width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="rgba(255, 255, 255, 0.65)" />
            </pattern>

            <pattern id={smoothId} width="6" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" />
            </pattern>
          </defs>

          <line
            className="chart-grid-line"
            x1={marginLeft}
            y1={marginTop}
            x2={svgWidth - marginRight}
            y2={marginTop}
            stroke="var(--hig-border, rgba(0,0,0,0.08))"
            strokeDasharray="3 3"
          />
          <line
            className="chart-grid-line"
            x1={marginLeft}
            y1={marginTop + chartHeight / 2}
            x2={svgWidth - marginRight}
            y2={marginTop + chartHeight / 2}
            stroke="var(--hig-border, rgba(0,0,0,0.08))"
            strokeDasharray="3 3"
          />
          <line
            className="chart-grid-line"
            x1={marginLeft}
            y1={marginTop + chartHeight}
            x2={svgWidth - marginRight}
            y2={marginTop + chartHeight}
            stroke="var(--hig-border, rgba(0,0,0,0.08))"
          />

          <text
            className="chart-y-axis-label tabular-nums"
            x={svgWidth - marginRight + 8}
            y={marginTop + 4}
            fontSize="10"
            fill="var(--hig-text-secondary, #86868b)"
            textAnchor="start"
          >
            {microsToUsd(maxSpend)}
          </text>
          <text
            className="chart-y-axis-label tabular-nums"
            x={svgWidth - marginRight + 8}
            y={marginTop + chartHeight / 2 + 4}
            fontSize="10"
            fill="var(--hig-text-secondary, #86868b)"
            textAnchor="start"
          >
            {microsToUsd(midSpend)}
          </text>
          <text
            className="chart-y-axis-label tabular-nums"
            x={svgWidth - marginRight + 8}
            y={marginTop + chartHeight}
            fontSize="10"
            fill="var(--hig-text-secondary, #86868b)"
            textAnchor="start"
          >
            $0.00
          </text>

          {data.map((day, idx) => {
            const isSelected = idx === activeIndex;
            const x = marginLeft + idx * barStep + (barStep - barWidth) / 2;
            const { providers } = getDayProviders(day);

            let currentBottomY = marginTop + chartHeight;

            return (
              <g
                key={day.date}
                className="chart-day-bar-group"
                onClick={() => handleSelectIndex(idx)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <rect
                    x={x - 2}
                    y={marginTop}
                    width={barWidth + 4}
                    height={chartHeight}
                    fill="var(--hig-fill-secondary, rgba(120, 120, 128, 0.12))"
                    rx="4"
                  />
                )}

                {providers.map((p) => {
                  const segmentHeight = maxSpend > 0 ? (p.spend_micros / maxSpend) * chartHeight : 0;
                  if (segmentHeight < 0.5) return null;

                  const segY = currentBottomY - segmentHeight;
                  const finalHeight = Math.max(segmentHeight - 1, 1);
                  currentBottomY = segY;

                  const color =
                    p.provider === 'anthropic'
                      ? 'var(--hig-provider-anthropic, #d97706)'
                      : p.provider === 'openai'
                        ? 'var(--hig-provider-openai, #06b6d4)'
                        : p.provider === 'gemini'
                          ? 'var(--hig-provider-gemini, #6366f1)'
                          : 'var(--hig-accent, #0071e3)';

                  const patternId =
                    p.provider === 'anthropic'
                      ? hatchId
                      : p.provider === 'openai'
                        ? dotsId
                        : p.provider === 'gemini'
                          ? smoothId
                          : null;

                  return (
                    <g key={p.provider}>
                      <rect x={x} y={segY} width={barWidth} height={finalHeight} fill={color} rx="1.5" />
                      {patternId && (
                        <rect
                          x={x}
                          y={segY}
                          width={barWidth}
                          height={finalHeight}
                          fill={`url(#${patternId})`}
                          pointerEvents="none"
                          rx="1.5"
                        />
                      )}
                    </g>
                  );
                })}

                {isSelected && (
                  <circle
                    cx={x + barWidth / 2}
                    cy={marginTop + chartHeight + 10}
                    r="3"
                    fill="var(--hig-accent, #0071e3)"
                  />
                )}

                {idx % labelInterval === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={marginTop + chartHeight + 22}
                    fontSize="10"
                    fill={isSelected ? 'var(--hig-text-primary)' : 'var(--hig-text-secondary)'}
                    fontWeight={isSelected ? 600 : 400}
                    textAnchor="middle"
                  >
                    {formatDateShort(day.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>
          Consumo diário por provedor nos últimos {periodDays} dias. Limite máximo: {microsToUsd(maxSpend)}.
        </caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Total</th>
            <th scope="col">Anthropic</th>
            <th scope="col">OpenAI</th>
            <th scope="col">Gemini</th>
            <th scope="col">Requisições</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => {
            const { providers } = getDayProviders(d);
            const anthropicSpend = providers.find((p) => p.provider === 'anthropic')?.spend_micros ?? 0;
            const openaiSpend = providers.find((p) => p.provider === 'openai')?.spend_micros ?? 0;
            const geminiSpend = providers.find((p) => p.provider === 'gemini')?.spend_micros ?? 0;

            return (
              <tr key={d.date}>
                <td>{formatDateShort(d.date)}</td>
                <td>{microsToUsd(d.spend_micros)}</td>
                <td>{microsToUsd(anthropicSpend)}</td>
                <td>{microsToUsd(openaiSpend)}</td>
                <td>{microsToUsd(geminiSpend)}</td>
                <td>{formatNumber(d.requests)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
