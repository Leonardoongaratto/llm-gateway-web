/**
 * Tipos TypeScript sincronizados com o contrato canônico docs/summary.example.json
 */

export interface DailySpend {
  date: string;
  spend_micros: number;
  requests: number;
  tokens: number;
}

export interface ModelSpend {
  model_id: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  percentage?: number;
}

export interface KeySpend {
  key_id: string;
  name: string;
  spend_micros: number;
  requests: number;
  tokens: number;
  daily_limit_micros?: number;
}

export interface ProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  spend_micros: number;
}

export interface SubscriptionSpend {
  id: string;
  name: string;
  provider: string;
  monthly_cost_micros: number;
  plan: string;
  status: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: string;
  details: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface SummaryResponse {
  period_days: number;
  start_date: string;
  end_date: string;
  spend_micros: number;
  prev_spend_micros: number;
  projected_month_micros: number;
  daily: DailySpend[];
  models?: ModelSpend[];
  keys?: KeySpend[];
  providers?: ProviderHealth[];
  subscriptions?: SubscriptionSpend[];
  events?: AuditEvent[];
}

export interface HealthResponse {
  status: string;
  services?: Record<string, string>;
}
