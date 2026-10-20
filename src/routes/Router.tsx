import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SkeletonCard } from '../components/Skeleton';
import { AppLayout } from '../layout/AppLayout';

const OverviewPage = React.lazy(() =>
  import('../pages/OverviewPage').then((m) => ({ default: m.OverviewPage })),
);
const ProjectsPage = React.lazy(() =>
  import('../pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ProvidersPage = React.lazy(() =>
  import('../pages/ProvidersPage').then((m) => ({ default: m.ProvidersPage })),
);
const EventsPage = React.lazy(() => import('../pages/EventsPage').then((m) => ({ default: m.EventsPage })));
const SettingsPage = React.lazy(() =>
  import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

export const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<SkeletonCard lines={4} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/projetos" element={<ProjectsPage />} />
          <Route path="/dashboard/provedores" element={<ProvidersPage />} />
          <Route path="/dashboard/eventos" element={<EventsPage />} />
          <Route path="/dashboard/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
