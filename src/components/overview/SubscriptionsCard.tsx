import React, { useState } from 'react';
import { microsToUsd } from '../../format/formatters';

export interface SubscriptionItem {
  id: string;
  name: string;
  provider: string;
  monthly_cost_micros: number;
  equivalent_value_micros: number;
  aproveitamento: number;
}

export interface SubscriptionsCardProps {
  subscriptions?: SubscriptionItem[];
  className?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'var(--hig-provider-anthropic, #d97706)',
  openai: 'var(--hig-provider-openai, #06b6d4)',
  gemini: 'var(--hig-provider-gemini, #6366f1)',
};

export const SubscriptionsCard: React.FC<SubscriptionsCardProps> = ({
  subscriptions = [],
  className = '',
}) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div
        className={`subscriptions-card ${className}`.trim()}
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
        Nenhuma assinatura ativa encontrada.
      </div>
    );
  }

  return (
    <div
      className={`subscriptions-card ${className}`.trim()}
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
          Assinaturas e Eficiência
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
          {subscriptions.length} {subscriptions.length === 1 ? 'plano ativo' : 'planos ativos'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {subscriptions.map((sub) => {
          const providerKey = sub.provider.toLowerCase();
          const color = PROVIDER_COLORS[providerKey] ?? 'var(--hig-accent)';
          const hasTelemetry =
            sub.equivalent_value_micros > 0 || sub.aproveitamento > 0 || providerKey !== 'gemini';

          const isTooltipOpen = activeTooltipId === sub.id;

          return (
            <div
              key={sub.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: 'var(--hig-radius-md, 8px)',
                background: 'var(--hig-bg-grouped, #f5f5f7)',
                border: '1px solid var(--hig-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <strong style={{ fontSize: '14px', color: 'var(--hig-text-primary)' }}>{sub.name}</strong>
                </div>

                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--hig-text-secondary)',
                  }}
                >
                  {microsToUsd(sub.monthly_cost_micros)} / mês
                </span>
              </div>

              {hasTelemetry ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--hig-text-secondary)' }}>Valor equivalente:</span>
                    <strong className="tabular-nums" style={{ color: 'var(--hig-text-primary)' }}>
                      {microsToUsd(sub.equivalent_value_micros)}
                    </strong>

                    {/* Badge Estimado com popover */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTooltipId(isTooltipOpen ? null : sub.id)}
                        onMouseEnter={() => setActiveTooltipId(sub.id)}
                        onMouseLeave={() => setActiveTooltipId(null)}
                        aria-label="Informações sobre custo estimado"
                        style={{
                          background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.16))',
                          border: 'none',
                          color: 'var(--hig-text-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 'var(--hig-radius-sm, 4px)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        estimado ⓘ
                      </button>

                      {isTooltipOpen && (
                        <div
                          role="tooltip"
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '6px',
                            background: 'var(--hig-text-primary, #1d1d1f)',
                            color: '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            lineHeight: '1.4',
                            whiteSpace: 'normal',
                            width: '240px',
                            zIndex: 100,
                            boxShadow: 'var(--hig-shadow-md)',
                            pointerEvents: 'none',
                          }}
                        >
                          Valor que essas mensagens custariam na API; você paga a assinatura fixa.
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="tabular-nums"
                    style={{
                      fontWeight: 600,
                      color:
                        sub.aproveitamento >= 1
                          ? 'var(--hig-success, #34c759)'
                          : 'var(--hig-warning, #ff9500)',
                    }}
                  >
                    rendeu {sub.aproveitamento.toFixed(1)}× o que custa
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--hig-text-tertiary, #86868b)',
                    fontStyle: 'italic',
                  }}
                >
                  consumo não disponível para este provedor
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
