import React from 'react';
import { formatNumber, microsToUsd } from '../../format/formatters';

export interface ModelShareItem {
  model: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  percentage?: number;
}

export interface ModelShareBarsProps {
  models: ModelShareItem[];
  totalSpendMicros?: number;
  className?: string;
}

function getModelColor(modelName: string): string {
  const lower = modelName.toLowerCase();
  if (lower.includes('claude') || lower.includes('anthropic')) {
    return 'var(--hig-provider-anthropic, #d97706)';
  }
  if (lower.includes('gpt') || lower.includes('openai') || lower.includes('o1') || lower.includes('o3')) {
    return 'var(--hig-provider-openai, #06b6d4)';
  }
  if (lower.includes('gemini') || lower.includes('google')) {
    return 'var(--hig-provider-gemini, #6366f1)';
  }
  return 'var(--hig-accent, #0071e3)';
}

export const ModelShareBars: React.FC<ModelShareBarsProps> = ({ models, className = '' }) => {
  if (!models || models.length === 0) {
    return (
      <div
        className={`model-share-card ${className}`.trim()}
        style={{
          background: 'var(--hig-bg-card)',
          borderRadius: 'var(--hig-radius-lg, 12px)',
          border: '1px solid var(--hig-border)',
          padding: '20px',
          color: 'var(--hig-text-secondary)',
          textAlign: 'center',
          fontSize: '13px',
        }}
      >
        Nenhum dado de modelo disponível no período.
      </div>
    );
  }

  const sorted = [...models].sort((a, b) => b.spend_micros - a.spend_micros);
  const modelsTotal = sorted.reduce((acc, m) => acc + m.spend_micros, 0);

  if (modelsTotal === 0) {
    return (
      <div
        className={`model-share-card ${className}`.trim()}
        style={{
          background: 'var(--hig-bg-card)',
          borderRadius: 'var(--hig-radius-lg, 12px)',
          border: '1px solid var(--hig-border)',
          padding: '20px',
          color: 'var(--hig-text-secondary)',
          textAlign: 'center',
          fontSize: '13px',
        }}
      >
        Nenhum dado de modelo disponível no período.
      </div>
    );
  }

  const rawPercentages = sorted.map((m) => (m.spend_micros / modelsTotal) * 100);
  const basePercentages = rawPercentages.map((p) => Math.floor(p * 10) / 10);
  const remainders = rawPercentages.map((p, idx) => ({
    index: idx,
    remainder: p - (basePercentages[idx] ?? 0),
  }));

  const currentSumTenths = Math.round(basePercentages.reduce((a, b) => a + b, 0) * 10);
  const targetTenths = 1000;
  const missingTenths = Math.max(0, targetTenths - currentSumTenths);

  remainders.sort((a, b) => b.remainder - a.remainder);
  const finalPercentages = [...basePercentages];

  for (let i = 0; i < missingTenths && i < remainders.length; i++) {
    const idx = remainders[i]?.index;
    if (idx !== undefined && finalPercentages[idx] !== undefined) {
      finalPercentages[idx] = Math.round((finalPercentages[idx] + 0.1) * 10) / 10;
    }
  }

  return (
    <div
      className={`model-share-card ${className}`.trim()}
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
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--hig-text-primary)',
          }}
        >
          Participação por Modelo
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
          {sorted.length} {sorted.length === 1 ? 'modelo' : 'modelos'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sorted.map((item, index) => {
          const pct = finalPercentages[index] ?? 0;
          const color = getModelColor(item.model);

          return (
            <div key={item.model} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="model-share-name"
                    style={{
                      fontWeight: 600,
                      color: 'var(--hig-text-primary)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '12px',
                    }}
                  >
                    {item.model}
                  </span>
                  <span
                    className="model-share-percent tabular-nums"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--hig-text-secondary)',
                      background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.12))',
                      padding: '1px 6px',
                      borderRadius: 'var(--hig-radius-sm, 4px)',
                    }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <span
                  className="tabular-nums"
                  style={{
                    fontWeight: 600,
                    color: 'var(--hig-text-primary)',
                  }}
                >
                  {microsToUsd(item.spend_micros)}
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.16))',
                  borderRadius: 'var(--hig-radius-full, 9999px)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(Math.max(pct, 0), 100)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 'var(--hig-radius-full, 9999px)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--hig-text-tertiary, #86868b)',
                }}
              >
                <span className="tabular-nums">{formatNumber(item.requests)} reqs</span>
                <span>·</span>
                <span className="tabular-nums">{formatNumber(item.tokens)} tokens</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
