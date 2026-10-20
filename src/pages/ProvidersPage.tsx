import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { ModelSpend, ProviderSpend } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { formatNumber, microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

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
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Consumo por Provedor Conectado
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {providers.map((p) => (
              <div
                key={p.provider}
                style={{
                  padding: '16px',
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
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '15px', textTransform: 'capitalize' }}>
                    {p.provider}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--hig-radius-pill)',
                      backgroundColor: 'var(--hig-success-subtle)',
                      color: 'var(--hig-success)',
                    }}
                  >
                    Ativo
                  </span>
                </div>
                <div
                  style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}
                  className="tabular-nums"
                >
                  {microsToUsd(p.spend_micros)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--hig-text-secondary)' }}>
                  <span className="tabular-nums">{formatNumber(p.requests)}</span> reqs ·{' '}
                  <span className="tabular-nums">{formatNumber(p.tokens)}</span> tokens
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <tr key={m.model} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'var(--hig-font-mono)' }}>
                      {m.model}
                    </td>
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
