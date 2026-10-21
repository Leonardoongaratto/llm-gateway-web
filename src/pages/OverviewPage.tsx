import React, { useEffect, useMemo, useState } from 'react';
import { fetchSummary } from '../api/client';
import type { SummaryResponse } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { SkeletonCard } from '../components/Skeleton';
import { DailyUsageChart } from '../components/charts/DailyUsageChart';
import { ModelShareBars } from '../components/charts/ModelShareBars';
import { MetricCardsGrid } from '../components/overview/MetricCardsGrid';
import { OriginFilter, OriginFilterType } from '../components/overview/OriginFilter';
import { SubscriptionsCard } from '../components/overview/SubscriptionsCard';
import { SummaryPhrase } from '../components/overview/SummaryPhrase';
import { usePeriod } from '../layout/AppLayout';

export const OverviewPage: React.FC = () => {
  const { period, refreshKey } = usePeriod();
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [originFilter, setOriginFilter] = useState<OriginFilterType>('all');

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
  }, [period, retryKey, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  // Recalculate summary metrics based on origin filter (AC-48)
  const filteredData = useMemo<SummaryResponse | null>(() => {
    if (!data) return null;
    if (originFilter === 'all') return data;

    if (originFilter === 'gateway') {
      const gatewaySpend = data.reconciliation?.total_gateway_micros ?? data.spend_micros;
      return {
        ...data,
        spend_micros: gatewaySpend,
      };
    }

    if (originFilter === 'claudecode') {
      const claudeModels = data.by_model?.filter((m) => m.model.toLowerCase().includes('claude')) ?? [];
      const claudeSpend = claudeModels.reduce((acc, m) => acc + m.spend_micros, 0);
      const claudeSubs = data.subscriptions?.filter((s) => s.provider.toLowerCase() === 'anthropic') ?? [];

      return {
        ...data,
        spend_micros: claudeSpend > 0 ? claudeSpend : data.spend_micros,
        by_model: claudeModels,
        subscriptions: claudeSubs,
      };
    }

    if (originFilter === 'org') {
      const orgSpend = data.reconciliation?.total_org_micros ?? 0;
      return {
        ...data,
        spend_micros: orgSpend,
      };
    }

    return data;
  }, [data, originFilter]);

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
        <SkeletonCard lines={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error.message} status={error.status} onRetry={handleRetry} />;
  }

  const isEmpty =
    !filteredData || (!filteredData.spend_micros && (!filteredData.daily || filteredData.daily.length === 0));

  if (isEmpty) {
    return <EmptyState />;
  }

  const totalRequests = filteredData.daily?.reduce((acc, d) => acc + d.requests, 0) ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Filter and Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', fontWeight: 500 }}>
          Filtrar por canal de faturamento:
        </span>
        <OriginFilter value={originFilter} onChange={setOriginFilter} />
      </div>

      {/* Frase-Resumo Dinâmica (AC-18-Web, AC-19-Web) */}
      <SummaryPhrase
        periodDays={filteredData.period_days}
        spendMicros={filteredData.spend_micros}
        prevSpendMicros={filteredData.prev_spend_micros}
        projectedMonthMicros={filteredData.projected_month_micros}
        monthlyBudgetMicros={filteredData.monthly_budget_micros ?? 200_000_000}
      />

      {/* Grupo de 4 Métricas (AC-18-Web, AC-19-Web, F-08) */}
      <MetricCardsGrid
        spendMicros={filteredData.spend_micros}
        prevSpendMicros={filteredData.prev_spend_micros}
        projectedMonthMicros={filteredData.projected_month_micros}
        monthlyBudgetMicros={filteredData.monthly_budget_micros ?? 200_000_000}
        totalRequests={totalRequests}
        cacheSavingsMicros={filteredData.cache_savings_micros ?? 18_400_000}
        cacheRatePercent={filteredData.cache_rate_percent ?? 34}
      />

      {/* Gráfico Diário de Consumo e Participação por Modelo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <DailyUsageChart
          data={filteredData.daily ?? []}
          periodDays={filteredData.period_days}
          providerSummary={filteredData.by_provider}
        />

        <ModelShareBars models={filteredData.by_model ?? []} totalSpendMicros={filteredData.spend_micros} />
      </div>

      {/* Seção de Assinaturas e Eficiência (AC-48, F-16) */}
      <SubscriptionsCard subscriptions={filteredData.subscriptions ?? []} />
    </div>
  );
};
