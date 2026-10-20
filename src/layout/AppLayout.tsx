import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { onAuthRequired } from '../api/auth';
import { AuthDialog } from '../components/AuthDialog';
import { Sidebar } from './Sidebar';
import { Toolbar, type PeriodDays } from './Toolbar';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/dashboard/projetos': 'Projetos e Chaves',
  '/dashboard/provedores': 'Provedores e Modelos',
  '/dashboard/eventos': 'Auditoria e Eventos',
  '/dashboard/ajustes': 'Ajustes e Configurações',
};

interface PeriodContextType {
  period: PeriodDays;
  setPeriod: (period: PeriodDays) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const PeriodContext = createContext<PeriodContextType>({
  period: 30,
  setPeriod: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const usePeriod = () => useContext(PeriodContext);

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [period, setPeriodState] = useState<PeriodDays>(() => {
    try {
      const stored = localStorage.getItem('lgw_period_days');
      if (stored === '7' || stored === '30' || stored === '90') {
        return parseInt(stored, 10) as PeriodDays;
      }
    } catch {
      return 30;
    }
    return 30;
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const unsubscribe = onAuthRequired(() => {
      setIsAuthOpen(true);
    });
    return unsubscribe;
  }, []);

  const handlePeriodChange = (nextPeriod: PeriodDays) => {
    setPeriodState(nextPeriod);
    try {
      localStorage.setItem('lgw_period_days', String(nextPeriod));
    } catch {
      return;
    }
  };

  const currentPath = location.pathname;
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  const matchedRoute = Object.entries(ROUTE_TITLES)
    .sort(([a], [b]) => b.length - a.length)
    .find(([routePath]) => normalizedPath === routePath || normalizedPath.startsWith(`${routePath}/`));
  const title = matchedRoute ? matchedRoute[1] : 'Visão Geral';

  useEffect(() => {
    document.title = `${title} · LLM Gateway`;
  }, [title]);

  const handleAuthClose = React.useCallback(() => {
    setIsAuthOpen(false);
  }, []);

  return (
    <PeriodContext.Provider
      value={{
        period,
        setPeriod: handlePeriodChange,
        refreshKey,
        triggerRefresh,
      }}
    >
      <div className="app-shell">
        <Sidebar activePath={normalizedPath} />

        <div className="main-content-wrapper">
          <Toolbar
            title={title}
            period={period}
            onPeriodChange={handlePeriodChange}
            onAuthClick={() => setIsAuthOpen(true)}
          />

          <main className="content-body">{children}</main>
        </div>

        <AuthDialog
          isOpen={isAuthOpen}
          onClose={handleAuthClose}
          onSuccess={() => {
            setIsAuthOpen(false);
            triggerRefresh();
          }}
        />
      </div>
    </PeriodContext.Provider>
  );
};
