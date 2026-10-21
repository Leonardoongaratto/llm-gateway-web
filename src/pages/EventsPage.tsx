import React, { useEffect, useMemo, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { EventItem, EventType } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { StatusBadge, type StatusBadgeVariant } from '../components/StatusBadge';
import { microsToUsd } from '../format/formatters';
import { usePeriod } from '../layout/AppLayout';

const resolveEventBadge = (
  type: EventType,
  status?: string,
): { variant: StatusBadgeVariant; label: string } => {
  switch (type) {
    case 'usage':
      return { variant: 'info', label: 'Uso' };
    case 'budget.threshold':
      if (status === 'error') {
        return { variant: 'danger', label: 'Orçamento' };
      }
      return { variant: 'warning', label: 'Orçamento' };
    case 'provider.fallback':
      return { variant: 'fallback', label: 'Fallback' };
    case 'config.changed':
      return { variant: 'neutral', label: 'Configuração' };
    default:
      return { variant: 'neutral', label: type };
  }
};

const formatEventTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const EventsPage: React.FC = () => {
  const { period, refreshKey } = usePeriod();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    let active = true;

    fetchSummary(period)
      .then((res) => {
        if (!active) return;
        setEvents(res.events || []);
        setError(null);
      })
      .catch((err: { message?: string }) => {
        if (!active) return;
        setError(err.message || 'Falha ao obter eventos.');
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

  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return events;
    return events.filter((e) => e.type === selectedType);
  }, [events, selectedType]);

  if (loading) {
    return <SkeletonCard lines={5} />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={handleRetry} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="Nenhum evento registrado"
        description="Eventos de auditoria, atualizações de orçamento e fallbacks do NATS aparecerão aqui em tempo real."
      />
    );
  }

  return (
    <div className="hig-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Eventos de Auditoria e Sistema</h2>
          <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginTop: '4px' }}>
            Registro cronológico de consumo, alertas de orçamento e roteamento por fallback.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            htmlFor="event-type-filter"
            style={{ fontSize: '12px', color: 'var(--hig-text-secondary)', fontWeight: 500 }}
          >
            Filtrar por tipo:
          </label>
          <select
            id="event-type-filter"
            aria-label="Filtrar por tipo"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              borderRadius: 'var(--hig-radius-sm)',
              border: '1px solid var(--hig-border)',
              backgroundColor: 'var(--hig-bg-grouped)',
              color: 'var(--hig-text-primary)',
              fontFamily: 'var(--hig-font-system)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos os eventos</option>
            <option value="usage">Uso</option>
            <option value="budget.threshold">Orçamento</option>
            <option value="provider.fallback">Fallback</option>
            <option value="config.changed">Configuração</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--hig-border)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Horário</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Tipo</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Chave</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Provedor / Modelo</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Custo</th>
              <th style={{ padding: '10px 12px', color: 'var(--hig-text-secondary)' }}>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--hig-text-secondary)',
                  }}
                >
                  Nenhum evento deste tipo no período
                </td>
              </tr>
            ) : (
              filteredEvents.map((e) => {
                const badge = resolveEventBadge(e.type, e.status);
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--hig-separator)' }}>
                    <td
                      style={{
                        padding: '12px',
                        color: 'var(--hig-text-secondary)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                      className="tabular-nums"
                    >
                      {formatEventTimestamp(e.timestamp)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <StatusBadge variant={badge.variant} label={badge.label} />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--hig-font-mono)',
                          fontSize: '12px',
                          color: 'var(--hig-text-primary)',
                        }}
                      >
                        {e.key_id || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--hig-text-primary)' }}>
                      {e.provider || e.model ? (
                        <span>
                          {e.provider && (
                            <strong style={{ textTransform: 'capitalize' }}>{e.provider} </strong>
                          )}
                          {e.model && (
                            <span
                              style={{
                                fontFamily: 'var(--hig-font-mono)',
                                fontSize: '12px',
                                color: 'var(--hig-text-secondary)',
                              }}
                            >
                              ({e.model})
                            </span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px' }} className="tabular-nums">
                      {e.cost_micros !== undefined ? microsToUsd(e.cost_micros) : '—'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--hig-text-secondary)' }}>
                      {e.message || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
