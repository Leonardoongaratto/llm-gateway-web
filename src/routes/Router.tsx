import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { EventsPage } from '../pages/EventsPage';
import { OverviewPage } from '../pages/OverviewPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProvidersPage } from '../pages/ProvidersPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/dashboard/projetos" element={<ProjectsPage />} />
        <Route path="/dashboard/provedores" element={<ProvidersPage />} />
        <Route path="/dashboard/eventos" element={<EventsPage />} />
        <Route path="/dashboard/ajustes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};
