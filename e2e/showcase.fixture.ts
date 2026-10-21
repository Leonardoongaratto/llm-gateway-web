import type { SummaryResponse } from '../src/api/types';

interface RawDayData {
  date: string;
  spendMicros: number;
  requests: number;
  tokens: number;
}

function generate90Days(): RawDayData[] {
  const days: RawDayData[] = [];
  const baseEpochMs = Date.UTC(2026, 6, 24);

  for (let i = 0; i < 90; i++) {
    const dayMs = baseEpochMs + i * 86400000;
    const d = new Date(dayMs);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getUTCDay();

    const growthFactor = 1 + (i / 90) * 0.35;
    let baseMicros = 4_800_000 * growthFactor;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseMicros *= 0.35;
    } else {
      baseMicros *= 0.92 + 0.16 * Math.sin((i * 13) % 7);
    }

    if (i === 75) {
      baseMicros *= 2.15;
    }

    const spendMicros = Math.round(baseMicros);
    const tokens = Math.round(spendMicros * 0.125);
    const requests = Math.max(80, Math.round(spendMicros / 10_500));

    days.push({
      date: dateStr,
      spendMicros,
      requests,
      tokens,
    });
  }

  return days;
}

const ALL_90_DAYS = generate90Days();

export function getShowcaseSummary(days: 7 | 30 | 90 = 30): SummaryResponse {
  const selectedDays = ALL_90_DAYS.slice(90 - days);
  const totalSpend = selectedDays.reduce((acc, d) => acc + d.spendMicros, 0);
  const totalRequests = selectedDays.reduce((acc, d) => acc + d.requests, 0);
  const totalTokens = selectedDays.reduce((acc, d) => acc + d.tokens, 0);

  const prevDays = ALL_90_DAYS.slice(Math.max(0, 90 - 2 * days), 90 - days);
  const prevSpend = prevDays.reduce((acc, d) => acc + d.spendMicros, 0);

  const mSonnet = Math.round(totalSpend * 0.42);
  const mHaiku = Math.round(totalSpend * 0.18);
  const mGpt5 = Math.round(totalSpend * 0.2);
  const mGpt5Mini = Math.round(totalSpend * 0.08);
  const mGeminiPro = Math.round(totalSpend * 0.08);
  const mGeminiFlash = totalSpend - (mSonnet + mHaiku + mGpt5 + mGpt5Mini + mGeminiPro);

  const byModel = [
    {
      model: 'claude-sonnet-5',
      spend_micros: mSonnet,
      requests: Math.round(totalRequests * 0.35),
      tokens: Math.round(totalTokens * 0.45),
    },
    {
      model: 'gpt-5',
      spend_micros: mGpt5,
      requests: Math.round(totalRequests * 0.22),
      tokens: Math.round(totalTokens * 0.22),
    },
    {
      model: 'claude-haiku-4-5',
      spend_micros: mHaiku,
      requests: Math.round(totalRequests * 0.2),
      tokens: Math.round(totalTokens * 0.15),
    },
    {
      model: 'gpt-5-mini',
      spend_micros: mGpt5Mini,
      requests: Math.round(totalRequests * 0.1),
      tokens: Math.round(totalTokens * 0.07),
    },
    {
      model: 'gemini-2.5-pro',
      spend_micros: mGeminiPro,
      requests: Math.round(totalRequests * 0.08),
      tokens: Math.round(totalTokens * 0.07),
    },
    {
      model: 'gemini-2.5-flash',
      spend_micros: mGeminiFlash,
      requests: Math.round(totalRequests * 0.05),
      tokens: Math.round(totalTokens * 0.04),
    },
  ];

  const anthropicSpend = mSonnet + mHaiku;
  const openaiSpend = mGpt5 + mGpt5Mini;
  const geminiSpend = mGeminiPro + mGeminiFlash;

  const byProvider = [
    {
      provider: 'anthropic' as const,
      spend_micros: anthropicSpend,
      requests: Math.round(totalRequests * 0.55),
      tokens: Math.round(totalTokens * 0.6),
      status: 'operating' as const,
      latency_p50_ms: 320,
      latency_p99_ms: 890,
      failures_24h: 0,
    },
    {
      provider: 'openai' as const,
      spend_micros: openaiSpend,
      requests: Math.round(totalRequests * 0.32),
      tokens: Math.round(totalTokens * 0.29),
      status: 'operating' as const,
      latency_p50_ms: 280,
      latency_p99_ms: 760,
      failures_24h: 0,
    },
    {
      provider: 'gemini' as const,
      spend_micros: geminiSpend,
      requests: Math.round(totalRequests * 0.13),
      tokens: Math.round(totalTokens * 0.11),
      status: 'degraded' as const,
      latency_p50_ms: 410,
      latency_p99_ms: 1250,
      failures_24h: 2,
    },
  ];

  const kChatbot = Math.round(totalSpend * 0.38);
  const kMobile = Math.round(totalSpend * 0.32);
  const kAnalytics = Math.round(totalSpend * 0.2);
  const kAssist = totalSpend - (kChatbot + kMobile + kAnalytics);

  const byKey = [
    {
      key_id: 'suporte-chatbot',
      name: 'Chatbot de Suporte N1',
      spend_micros: kChatbot,
      requests: Math.round(totalRequests * 0.42),
      tokens: Math.round(totalTokens * 0.4),
      budget_micros: Math.round(kChatbot / 0.84),
    },
    {
      key_id: 'app-mobile',
      name: 'Aplicativo Mobile iOS/Android',
      spend_micros: kMobile,
      requests: Math.round(totalRequests * 0.32),
      tokens: Math.round(totalTokens * 0.3),
      budget_micros: Math.round(kMobile / 0.72),
    },
    {
      key_id: 'analytics-worker',
      name: 'Processamento de BI & Analytics',
      spend_micros: kAnalytics,
      requests: Math.round(totalRequests * 0.16),
      tokens: Math.round(totalTokens * 0.2),
      budget_micros: Math.round(kAnalytics / 0.88),
    },
    {
      key_id: 'agent-assist',
      name: 'Assistente Autônomo de Dev',
      spend_micros: kAssist,
      requests: Math.round(totalRequests * 0.1),
      tokens: Math.round(totalTokens * 0.1),
      budget_micros: Math.round(kAssist / 0.55),
    },
  ];

  const monthlyBudget = Math.round(totalSpend / 0.76);
  const projectedMonth = Math.round(totalSpend * 1.08);

  const events: SummaryResponse['events'] = [
    {
      id: 'ev-1',
      type: 'budget.threshold',
      timestamp: '2026-10-21T14:15:00Z',
      key_id: 'suporte-chatbot',
      status: 'warning',
      message: 'Consumo atingiu 84% do teto mensal estabelecido',
    },
    {
      id: 'ev-2',
      type: 'provider.fallback',
      timestamp: '2026-10-21T11:42:10Z',
      key_id: 'app-mobile',
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      status: 'warning',
      message: 'Latência elevada no Gemini 2.5, redirecionado para Claude Haiku',
    },
    {
      id: 'ev-3',
      type: 'usage',
      timestamp: '2026-10-21T10:30:22Z',
      key_id: 'analytics-worker',
      provider: 'openai',
      model: 'gpt-5',
      cost_micros: 28400,
      status: 'success',
      message: 'Inferência de sumarização analítica concluída',
    },
    {
      id: 'ev-4',
      type: 'config.changed',
      timestamp: '2026-10-20T18:00:00Z',
      key_id: 'admin',
      status: 'info',
      message: 'Tabela de preços atualizada com a família Claude 5',
    },
  ];

  return {
    period_days: days,
    start_date: selectedDays[0]!.date,
    end_date: selectedDays[selectedDays.length - 1]!.date,
    spend_micros: totalSpend,
    prev_spend_micros: prevSpend,
    projected_month_micros: projectedMonth,
    monthly_budget_micros: monthlyBudget,
    cache_savings_micros: Math.round(totalSpend * 0.22),
    cache_rate_percent: 22,
    daily: selectedDays.map((d) => ({
      date: d.date,
      spend_micros: d.spendMicros,
      requests: d.requests,
      tokens: d.tokens,
    })),
    by_model: byModel,
    by_provider: byProvider,
    by_key: byKey,
    subscriptions: [
      {
        id: 'sub-claude-code',
        name: 'Claude Code Pro (Anthropic)',
        provider: 'anthropic',
        monthly_cost_micros: 20_000_000,
        equivalent_value_micros: 84_000_000,
        aproveitamento: 4.2,
      },
      {
        id: 'sub-gemini-adv',
        name: 'Google AI Pro',
        provider: 'gemini',
        monthly_cost_micros: 20_000_000,
        equivalent_value_micros: 35_000_000,
        aproveitamento: 1.75,
      },
    ],
    events,
  };
}
