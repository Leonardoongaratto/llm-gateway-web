import { describe, expect, it } from 'vitest';
import { getShowcaseSummary } from '../../e2e/showcase.fixture';

describe('Showcase Fixture Generator (AC-SHOW-01)', () => {
  it('returns valid SummaryResponse with strict mathematical integrity for 7, 30 and 90 days', () => {
    for (const days of [7, 30, 90] as const) {
      const summary = getShowcaseSummary(days);

      expect(summary.period_days).toBe(days);
      expect(summary.daily).toHaveLength(days);

      const sumDaily = summary.daily.reduce((acc, d) => acc + d.spend_micros, 0);
      expect(sumDaily).toBe(summary.spend_micros);

      const sumModels = (summary.by_model ?? []).reduce((acc, m) => acc + m.spend_micros, 0);
      expect(sumModels).toBe(summary.spend_micros);

      const sumKeys = (summary.by_key ?? []).reduce((acc, k) => acc + k.spend_micros, 0);
      expect(sumKeys).toBe(summary.spend_micros);

      const sumProviders = (summary.by_provider ?? []).reduce((acc, p) => acc + p.spend_micros, 0);
      expect(sumProviders).toBe(summary.spend_micros);
    }
  });

  it('demonstrates realistic seasonality with weekend volume at 30-40% of weekday volume', () => {
    const summary = getShowcaseSummary(30);

    const weekdaySpends: number[] = [];
    const weekendSpends: number[] = [];

    for (const day of summary.daily) {
      const date = new Date(day.date + 'T12:00:00Z');
      const dayOfWeek = date.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendSpends.push(day.spend_micros);
      } else {
        weekdaySpends.push(day.spend_micros);
      }
    }

    const avgWeekday = weekdaySpends.reduce((a, b) => a + b, 0) / weekdaySpends.length;
    const avgWeekend = weekendSpends.reduce((a, b) => a + b, 0) / weekendSpends.length;
    const weekendRatio = avgWeekend / avgWeekday;

    expect(weekendRatio).toBeGreaterThanOrEqual(0.3);
    expect(weekendRatio).toBeLessThanOrEqual(0.4);
  });

  it('features at least one prominent peak day', () => {
    const summary = getShowcaseSummary(30);
    const avgSpend = summary.spend_micros / summary.daily.length;
    const maxSpend = Math.max(...summary.daily.map((d) => d.spend_micros));

    expect(maxSpend).toBeGreaterThanOrEqual(avgSpend * 1.6);
  });

  it('includes 3 providers (Anthropic, OpenAI, Gemini) and active contemporary 2026 models (AC-SHOW-04)', () => {
    const summary = getShowcaseSummary(30);

    const providers = (summary.by_provider ?? []).map((p) => p.provider);
    expect(providers).toEqual(expect.arrayContaining(['anthropic', 'openai', 'gemini']));
    expect(providers).toHaveLength(3);

    for (const p of summary.by_provider ?? []) {
      expect(p.spend_micros).toBeGreaterThan(0);
      expect(p.requests).toBeGreaterThan(0);
    }

    const models = (summary.by_model ?? []).map((m) => m.model);
    expect(models).toContain('claude-sonnet-5');
    expect(models).toContain('claude-haiku-4-5');
    expect(models).toContain('gpt-5');
    expect(models).toContain('gpt-5-mini');
    expect(models).toContain('gemini-2.5-pro');
    expect(models).toContain('gemini-2.5-flash');

    for (const m of models) {
      expect(m).not.toMatch(/^(claude-3|claude-sonnet-5-5|claude-haiku-5-5|gpt-4o|gemini-1\.5)/);
    }
  });

  it('includes credible volume, cache telemetry, and distinct budget states', () => {
    const summary = getShowcaseSummary(30);

    const totalRequests = summary.daily.reduce((acc, d) => acc + d.requests, 0);
    expect(totalRequests).toBeGreaterThan(5000);

    expect(summary.cache_rate_percent).toBeGreaterThanOrEqual(15);
    expect(summary.cache_rate_percent).toBeLessThanOrEqual(30);
    expect(summary.cache_savings_micros).toBeGreaterThan(0);

    const monthlyBudget = summary.monthly_budget_micros ?? 0;
    const monthSpend = summary.spend_micros;
    const budgetRatio = monthSpend / monthlyBudget;
    expect(budgetRatio).toBeGreaterThanOrEqual(0.7);
    expect(budgetRatio).toBeLessThanOrEqual(0.85);

    const keyNames = (summary.by_key ?? []).map((k) => k.key_id);
    expect(keyNames).toEqual(
      expect.arrayContaining(['suporte-chatbot', 'analytics-worker', 'app-mobile', 'agent-assist']),
    );

    const normalKeys = (summary.by_key ?? []).filter((k) => k.spend_micros / (k.budget_micros ?? 1) < 0.8);
    const nearLimitKeys = (summary.by_key ?? []).filter((k) => {
      const ratio = k.spend_micros / (k.budget_micros ?? 1);
      return ratio >= 0.8 && ratio < 1.0;
    });

    expect(normalKeys.length).toBeGreaterThanOrEqual(2);
    expect(nearLimitKeys.length).toBeGreaterThanOrEqual(2);
  });
});
