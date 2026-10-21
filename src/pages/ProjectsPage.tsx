import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { KeySpend } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
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

  const sortedKeys = [...keys].sort((a, b) => b.spend_micros - a.spend_micros);

  return (
    <div className="hig-card">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Chaves Virtuais e Orçamentos</h2>
        <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginTop: '4px' }}>
          Monitoramento de consumo, limites mensais e status de execução por projeto.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Chave / Nome</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Status</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)', minWidth: '180px' }}>
                Orçamento
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Consumo</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Requisições</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {sortedKeys.map((k) => {
              const hasBudget = typeof k.budget_micros === 'number' && k.budget_micros > 0;
              const ratio = hasBudget ? k.spend_micros / k.budget_micros! : null;
              const numericPercent =
                ratio !== null ? (ratio < 1.0 && ratio >= 0.995 ? 99.9 : Math.round(ratio * 100)) : null;
              const percentDisplay =
                ratio !== null ? (ratio < 1.0 && ratio >= 0.995 ? '99.9' : String(numericPercent)) : null;
              const clampedPercent = numericPercent !== null ? Math.min(Math.max(numericPercent, 0), 100) : 0;

              let badgeVariant: 'success' | 'warning' | 'danger' = 'success';
              let badgeLabel = 'Normal';

              if (ratio !== null) {
                if (ratio >= 1.0) {
                  badgeVariant = 'danger';
                  badgeLabel = 'Bloqueado';
                } else if (ratio >= 0.8) {
                  badgeVariant = 'warning';
                  badgeLabel = 'Perto do limite';
                } else {
                  badgeVariant = 'success';
                  badgeLabel = 'Normal';
                }
              }

              let barColor = 'var(--hig-success)';
              if (ratio !== null) {
                if (ratio >= 0.9) {
                  barColor = 'var(--hig-danger)';
                } else if (ratio >= 0.7) {
                  barColor = 'var(--hig-warning)';
                }
              }

              return (
                <tr key={k.key_id} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                  <td style={{ padding: '12px' }}>
                    {k.name && (
                      <div style={{ fontWeight: 600, color: 'var(--hig-text-primary)', marginBottom: '2px' }}>
                        {k.name}
                      </div>
                    )}
                    <div
                      style={{
                        fontFamily: 'var(--hig-font-mono)',
                        fontSize: '12px',
                        color: k.name ? 'var(--hig-text-secondary)' : 'var(--hig-text-primary)',
                        fontWeight: k.name ? 400 : 600,
                      }}
                    >
                      {k.key_id}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge variant={badgeVariant} label={badgeLabel} />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div
                        role="meter"
                        aria-valuenow={numericPercent ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuetext={
                          percentDisplay !== null
                            ? `${percentDisplay}% do orçamento consumido`
                            : 'Sem limite definido'
                        }
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'var(--hig-bg-tertiary)',
                          borderRadius: 'var(--hig-radius-pill)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${clampedPercent}%`,
                            height: '100%',
                            backgroundColor: hasBudget ? barColor : 'transparent',
                            borderRadius: 'var(--hig-radius-pill)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--hig-text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                        className="tabular-nums"
                      >
                        {hasBudget ? (
                          <>
                            <span>
                              {microsToUsd(k.spend_micros)} de {microsToUsd(k.budget_micros!)}
                            </span>
                            <span style={{ fontWeight: 600 }}>{percentDisplay}%</span>
                          </>
                        ) : (
                          <span>Sem limite definido</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }} className="tabular-nums">
                    {microsToUsd(k.spend_micros)}
                  </td>
                  <td style={{ padding: '12px' }} className="tabular-nums">
                    {formatNumber(k.requests)}
                  </td>
                  <td style={{ padding: '12px' }} className="tabular-nums">
                    {formatNumber(k.tokens)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
