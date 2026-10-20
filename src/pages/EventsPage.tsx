import React from 'react';
import { EmptyState } from '../components/EmptyState';

export const EventsPage: React.FC = () => {
  return (
    <EmptyState
      title="Nenhum evento registrado"
      description="Eventos de auditoria, atualizações de orçamento e fallbacks do NATS aparecerão aqui em tempo real."
    />
  );
};
