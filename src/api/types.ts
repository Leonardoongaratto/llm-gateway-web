export interface DailySpend {
  date: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  by_provider?: ProviderSpend[];
}

export interface ModelSpend {
  model: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  percentage?: number;
}

export interface KeySpend {
  key_id: string;
  name?: string;
  spend_micros: number;
  budget_micros?: number;
  requests: number;
  tokens: number;
}

export interface ProviderSpend {
  provider: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  status?: 'operating' | 'degraded' | 'down';
  latency_p50_ms?: number;
  latency_p99_ms?: number;
  failures_24h?: number;
}

export type EventType = 'usage' | 'budget.threshold' | 'provider.fallback' | 'config.changed' | string;

export interface EventItem {
  id: string;
  type: EventType;
  timestamp: string;
  key_id?: string;
  provider?: string;
  model?: string;
  cost_micros?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  message?: string;
  details?: Record<string, unknown>;
}

export interface SubscriptionSpend {
  id: string;
  name: string;
  provider: string;
  monthly_cost_micros: number;
  equivalent_value_micros: number;
  aproveitamento: number;
}

export interface ProviderReconciliation {
  provider: string;
  gateway_spend_micros: number;
  org_spend_micros: number;
  overlap_micros: number;
  discrepancy_micros: number;
  reconciled_spend_micros: number;
}

export interface ReconciliationReport {
  by_provider?: Record<string, ProviderReconciliation>;
  total_gateway_micros?: number;
  total_org_micros?: number;
  total_overlap_micros?: number;
  total_discrepancy_micros?: number;
  total_reconciled_micros?: number;
}

export interface SummaryResponse {
  period_days: number;
  start_date: string;
  end_date: string;
  spend_micros: number;
  prev_spend_micros: number;
  projected_month_micros: number;
  daily: DailySpend[];
  by_model?: ModelSpend[];
  by_key?: KeySpend[];
  by_provider?: ProviderSpend[];
  subscriptions?: SubscriptionSpend[];
  reconciliation?: ReconciliationReport;
  events?: EventItem[];
  monthly_budget_micros?: number;
  cache_savings_micros?: number;
  cache_rate_percent?: number;
}

export interface HealthResponse {
  status: string;
  services?: Record<string, string>;
}
