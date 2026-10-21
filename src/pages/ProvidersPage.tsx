import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { ModelSpend, ProviderSpend } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { formatNumber, microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

const getProviderTheme = (provider: string) => {
  const norm = provider.toLowerCase();
  if (norm.includes('anthropic') || norm.includes('claude')) {
    return {
      color: 'var(--hig-provider-anthropic)',
      subtle: 'var(--hig-provider-anthropic-subtle)',
    };
  }
  if (norm.includes('openai') || norm.includes('gpt')) {
    return {
      color: 'var(--hig-provider-openai)',
      subtle: 'var(--hig-provider-openai-subtle)',
    };
  }
  if (norm.includes('gemini') || norm.includes('google')) {
    return {
      color: 'var(--hig-provider-gemini)',
      subtle: 'var(--hig-provider-gemini-subtle)',
    };
  }
  return {
    color: 'var(--hig-accent)',
    subtle: 'var(--hig-accent-subtle)',
  };
};

export const ProvidersPage: React.FC = () => {
  const { period, refreshKey } = usePeriod();
  const [providers, setProviders] = useState<ProviderSpend[]>([]);
  const [models, setModels] = useState<ModelSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSummary(period)
      .then((res) => {
        if (!active) return;
        setProviders(res.by_provider || []);
        setModels(res.by_model || []);
        setError(null);
      })
      .catch((err: { message?: string }) => {
        if (!active) return;
        setError(err.message || 'Falha ao carregar provedores e modelos.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period, retryKey, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={handleRetry} />;
  }

  if (providers.length === 0 && models.length === 0) {
    return (
      <EmptyState
        title="Nenhum provedor ativo no momento"
        description="Configure chaves da OpenAI, Anthropic ou Gemini para começar a rotear chamadas."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {providers.length > 0 && (
        <div className="hig-card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Consumo por Provedor Conectado</h2>
            <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginTop: '4px' }}>
              Estado operacional, latência p50/p99 e volume financeiro consolidado por provedor.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {providers.map((p) => {
              const theme = getProviderTheme(p.provider);

              let statusVariant: 'success' | 'warning' | 'danger';
              let statusLabel: string;

              const normStatus = (p.status || '').toLowerCase();
              if (normStatus === 'down') {
                statusVariant = 'danger';
                statusLabel = 'Fora';
              } else if (
                normStatus === 'degraded' ||
                (typeof p.failures_24h === 'number' && p.failures_24h > 0)
              ) {
                statusVariant = 'warning';
                statusLabel = 'Instável';
              } else {
                statusVariant = 'success';
                statusLabel = 'Operando';
              }

              return (
                <div
                  key={p.provider}
                  style={{
                    padding: '18px',
                    backgroundColor: 'var(--hig-bg-grouped)',
                    borderRadius: 'var(--hig-radius-md)',
                    border: '1px solid var(--hig-border)',
                    borderLeft: `4px solid ${theme.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: theme.color,
                          display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '15px',
                          textTransform: 'capitalize',
                          color: 'var(--hig-text-primary)',
                        }}
                      >
                        {p.provider}
                      </span>
                    </div>
                    <StatusBadge variant={statusVariant} label={statusLabel} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        marginBottom: '4px',
                      }}
                      className="tabular-nums"
                    >
                      {microsToUsd(p.spend_micros)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
                      <span className="tabular-nums">{formatNumber(p.requests)}</span> reqs ·{' '}
                      <span className="tabular-nums">{formatNumber(p.tokens)}</span> tokens
                    </div>
                  </div>

                  {(p.latency_p50_ms !== undefined ||
                    p.latency_p99_ms !== undefined ||
                    p.failures_24h !== undefined) && (
                    <div
                      style={{
                        paddingTop: '10px',
                        borderTop: '1px solid var(--hig-separator)',
                        fontSize: '11px',
                        color: 'var(--hig-text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                      className="tabular-nums"
                    >
                      {(p.latency_p50_ms !== undefined || p.latency_p99_ms !== undefined) && (
                        <div>
                          Latência: {p.latency_p50_ms !== undefined && <span>p50: {p.latency_p50_ms}ms</span>}
                          {p.latency_p50_ms !== undefined && p.latency_p99_ms !== undefined && ' · '}
                          {p.latency_p99_ms !== undefined && <span>p99: {p.latency_p99_ms}ms</span>}
                        </div>
                      )}
                      {p.failures_24h !== undefined && (
                        <div
                          style={{
                            color: p.failures_24h > 0 ? 'var(--hig-warning)' : 'var(--hig-text-secondary)',
                            fontWeight: p.failures_24h > 0 ? 600 : 400,
                          }}
                        >
                          {p.failures_24h} falhas (24h)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {models.length > 0 && (
        <div className="hig-card">
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Modelos de IA Mais Utilizados</h2>
            <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginTop: '4px' }}>
              Detalhamento de custo, chamadas e tokens processados por modelo no período selecionado.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Modelo</th>
                  <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Custo</th>
                  <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Requisições</th>
                  <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                    <td
                      style={{
                        padding: '12px',
                        fontWeight: 600,
                        fontFamily: 'var(--hig-font-mono)',
                      }}
                    >
                      {m.model}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }} className="tabular-nums">
                      {microsToUsd(m.spend_micros)}
                    </td>
                    <td style={{ padding: '12px' }} className="tabular-nums">
                      {formatNumber(m.requests)}
                    </td>
                    <td style={{ padding: '12px' }} className="tabular-nums">
                      {formatNumber(m.tokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
