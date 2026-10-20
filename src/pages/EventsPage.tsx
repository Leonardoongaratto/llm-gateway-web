import React, { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';

export const EventsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonCard lines={4} />;
  }

  return (
    <EmptyState
      title="Nenhum evento registrado"
      description="Eventos de auditoria, atualizações de orçamento e fallbacks do NATS aparecerão aqui em tempo real."
    />
  );
};
