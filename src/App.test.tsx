import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App Root Component (F-01 / F-06)', () => {
  const mockSummary = {
    period_days: 30,
    start_date: '2026-09-17',
    end_date: '2026-10-17',
    spend_micros: 1000000,
    prev_spend_micros: 1000000,
    projected_month_micros: 1000000,
    daily: [{ date: '2026-09-17', spend_micros: 1000000, requests: 5, tokens: 200 }],
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('/admin/summary')) {
        return {
          ok: true,
          status: 200,
          json: async () => mockSummary,
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders application with sidebar, toolbar and initial overview content', async () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: 'Menu Principal' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Custo Total (30d)')).toBeInTheDocument();
    });
  });
});
