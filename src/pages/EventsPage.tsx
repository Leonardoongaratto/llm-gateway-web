import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { AuditEvent } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { usePeriod } from '../layout/AppLayout';

export const EventsPage: React.FC = () => {
  const { period } = usePeriod();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

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
        setError(err.message || 'Falha ao carregar eventos de auditoria.');
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
    return <SkeletonCard lines={4} />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={handleRetry} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="Nenhum evento registrado"
        description="Eventos de auditoria, atualizações de orçamento e fallbacks aparecerão aqui em tempo real."
      />
    );
  }

  return (
    <div className="hig-card">
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Log de Eventos e Auditoria NATS
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--hig-bg-grouped)',
              borderRadius: 'var(--hig-radius-sm)',
              border: '1px solid var(--hig-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, marginRight: '8px' }}>{ev.type}</span>
              <span style={{ color: 'var(--hig-text-secondary)' }}>{ev.details}</span>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--hig-text-tertiary)',
                fontFamily: 'var(--hig-font-mono)',
              }}
            >
              {ev.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
