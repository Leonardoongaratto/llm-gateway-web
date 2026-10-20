import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { KeySpend } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { formatNumber, microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

export const ProjectsPage: React.FC = () => {
  const { period, refreshKey } = usePeriod();
  const [keys, setKeys] = useState<KeySpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchSummary(period)
      .then((res) => {
        if (active) {
          setKeys(res.by_key || []);
          setError(null);
        }
      })
      .catch((err: { message?: string }) => {
        if (active) {
          setError(err.message || 'Falha ao carregar projetos e chaves.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [period, retryKey, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  if (loading) {
    return <SkeletonCard lines={4} />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={handleRetry} />;
  }

  if (keys.length === 0) {
    return (
      <EmptyState
        title="Nenhum projeto ou chave virtual ativa"
        description="Crie uma chave virtual no serviço de controle para associar chamadas e limites de orçamento."
      />
    );
  }

  return (
    <div className="hig-card">
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Chaves Virtuais e Orçamentos
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Nome / ID</th>
              <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Consumo</th>
              <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Requisições</th>
              <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.key_id} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--hig-font-mono)' }}>{k.key_id}</div>
                </td>
                <td style={{ padding: '10px 12px' }} className="tabular-nums">
                  {microsToUsd(k.spend_micros)}
                </td>
                <td style={{ padding: '10px 12px' }} className="tabular-nums">
                  {formatNumber(k.requests)}
                </td>
                <td style={{ padding: '10px 12px' }} className="tabular-nums">
                  {formatNumber(k.tokens)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
