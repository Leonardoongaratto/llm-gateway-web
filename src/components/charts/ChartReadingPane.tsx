import React from 'react';
import { formatDateShort, formatNumber, microsToUsd } from '../../format/formatters';

export interface ProviderShare {
  provider: string;
  spend_micros: number;
  requests?: number;
}

export interface SelectedDayInfo {
  date: string;
  spend_micros: number;
  requests: number;
  tokens?: number;
  isEstimated?: boolean;
  providers?: ProviderShare[];
}

export interface ChartReadingPaneProps {
  selectedDay: SelectedDayInfo | null;
  className?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'var(--hig-provider-anthropic, #d97706)',
  openai: 'var(--hig-provider-openai, #06b6d4)',
  gemini: 'var(--hig-provider-gemini, #6366f1)',
  total: 'var(--hig-accent, #0071e3)',
};

const PROVIDER_NAMES: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
  total: 'Total',
};

export const ChartReadingPane: React.FC<ChartReadingPaneProps> = ({ selectedDay, className = '' }) => {
  if (!selectedDay) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`chart-reading-pane ${className}`.trim()}
        style={{
          padding: '12px 16px',
          background: 'var(--hig-bg-grouped, #f5f5f7)',
          borderRadius: 'var(--hig-radius-md, 8px)',
          border: '1px dashed var(--hig-border)',
          fontSize: '13px',
          color: 'var(--hig-text-secondary)',
          textAlign: 'center',
        }}
      >
        Nenhum dia selecionado. Use o mouse ou as teclas de seta (←/→) para inspecionar.
      </div>
    );
  }

  const formattedDate = formatDateShort(selectedDay.date);
  const formattedSpend = microsToUsd(selectedDay.spend_micros);
  const formattedRequests = formatNumber(selectedDay.requests);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`chart-reading-pane ${className}`.trim()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--hig-bg-card)',
        borderRadius: 'var(--hig-radius-md, 8px)',
        border: '1px solid var(--hig-border)',
        boxShadow: 'var(--hig-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04))',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--hig-text-primary)',
          }}
        >
          {formattedDate}
        </span>
        <span
          className="tabular-nums"
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--hig-text-primary)',
          }}
        >
          {formattedSpend}
        </span>
        <span style={{ color: 'var(--hig-text-secondary)', fontSize: '12px' }}>
          ({formattedRequests} requisições)
        </span>
        {selectedDay.isEstimated && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--hig-text-tertiary)',
              background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.12))',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            rateio estimado
          </span>
        )}
      </div>

      {selectedDay.providers && selectedDay.providers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {selectedDay.providers.map((p) => {
            const color = PROVIDER_COLORS[p.provider.toLowerCase()] ?? 'var(--hig-accent)';
            const name = PROVIDER_NAMES[p.provider.toLowerCase()] ?? p.provider;
            return (
              <div
                key={p.provider}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span style={{ color: 'var(--hig-text-secondary)' }}>{name}:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--hig-text-primary)' }}>
                  {microsToUsd(p.spend_micros)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
