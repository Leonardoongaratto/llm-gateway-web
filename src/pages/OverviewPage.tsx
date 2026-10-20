import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { SummaryResponse } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { formatDateShort, formatNumber, formatPercentChange, microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

export const OverviewPage: React.FC = () => {
  const { period } = usePeriod();
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchSummary(period)
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: { message?: string; status?: number }) => {
        if (active) {
          setError({
            message: err.message || 'Erro ao carregar dados do sumário.',
            status: err.status,
          });
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
  }, [period, retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error.message} status={error.status} onRetry={handleRetry} />;
  }

  const isEmpty = !data || (!data.spend_micros && (!data.daily || data.daily.length === 0));

  if (isEmpty) {
    return <EmptyState />;
  }

  const change = formatPercentChange(data.spend_micros, data.prev_spend_micros);
  const totalRequests = data.daily?.reduce((acc, d) => acc + d.requests, 0) ?? 0;
  const totalTokens = data.daily?.reduce((acc, d) => acc + d.tokens, 0) ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="hig-card">
          <span className="hig-card-label">Custo Total ({data.period_days}d)</span>
          <div className="hig-card-value tabular-nums">{microsToUsd(data.spend_micros)}</div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color:
                change.trend === 'down'
                  ? 'var(--hig-success)'
                  : change.trend === 'up'
                    ? 'var(--hig-danger)'
                    : 'var(--hig-text-secondary)',
              marginTop: '4px',
            }}
          >
            {change.formatted} vs período anterior
          </div>
        </div>

        <div className="hig-card">
          <span className="hig-card-label">Projeção Mensal</span>
          <div className="hig-card-value tabular-nums">{microsToUsd(data.projected_month_micros)}</div>
          <span style={{ fontSize: '11px', color: 'var(--hig-text-tertiary)', marginTop: '4px' }}>
            Baseado na média diária
          </span>
        </div>

        <div className="hig-card">
          <span className="hig-card-label">Requisições</span>
          <div className="hig-card-value tabular-nums">{formatNumber(totalRequests)}</div>
          <span style={{ fontSize: '11px', color: 'var(--hig-text-tertiary)', marginTop: '4px' }}>
            Chamadas roteadas
          </span>
        </div>

        <div className="hig-card">
          <span className="hig-card-label">Tokens Totais</span>
          <div className="hig-card-value tabular-nums">{formatNumber(totalTokens)}</div>
          <span style={{ fontSize: '11px', color: 'var(--hig-text-tertiary)', marginTop: '4px' }}>
            Input + Output
          </span>
        </div>
      </div>

      {data.daily && data.daily.length > 0 && (
        <div className="hig-card">
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Consumo Diário Recente</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Data</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Custo</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Requisições</th>
                  <th style={{ padding: '8px 12px', color: 'var(--hig-text-secondary)' }}>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.slice(-5).map((row) => (
                  <tr key={row.date} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                    <td style={{ padding: '10px 12px' }}>{formatDateShort(row.date)}</td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
                      {microsToUsd(row.spend_micros)}
                    </td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
                      {formatNumber(row.requests)}
                    </td>
                    <td style={{ padding: '10px 12px' }} className="tabular-nums">
                      {formatNumber(row.tokens)}
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
