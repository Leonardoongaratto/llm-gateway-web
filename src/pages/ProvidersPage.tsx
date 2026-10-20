import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { ModelSpend, ProviderHealth } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { formatNumber, microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

export const ProvidersPage: React.FC = () => {
  const { period } = usePeriod();
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [models, setModels] = useState<ModelSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSummary(period)
      .then((res) => {
        if (!active) return;
        setProviders(res.providers || []);
        setModels(res.models || []);
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
  }, [period, retryKey]);

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
      {/* Saúde dos Provedores */}
      {providers.length > 0 && (
        <div className="hig-card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Saúde dos Provedores Conectados
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            {providers.map((p) => (
              <div
                key={p.provider}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--hig-bg-grouped)',
                  borderRadius: 'var(--hig-radius-sm)',
                  border: '1px solid var(--hig-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.provider}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--hig-radius-pill)',
                      backgroundColor:
                        p.status === 'healthy'
                          ? 'var(--hig-success-subtle)'
                          : p.status === 'degraded'
                            ? 'var(--hig-warning-subtle)'
                            : 'var(--hig-danger-subtle)',
                      color:
                        p.status === 'healthy'
                          ? 'var(--hig-success)'
                          : p.status === 'degraded'
                            ? 'var(--hig-warning)'
                            : 'var(--hig-danger)',
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
                  Latência: <strong className="tabular-nums">{p.latency_ms}ms</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modelos e Consumo */}
      {models.length > 0 && (
        <div className="hig-card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Modelos de IA Mais Utilizados
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Modelo</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Custo</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Requisições</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model_id} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.model_id}</td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
                      {microsToUsd(m.spend_micros)}
                    </td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
                      {formatNumber(m.requests)}
                    </td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
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
