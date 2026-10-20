import React from 'react';
import { SegmentedControl, type SegmentOption } from './SegmentedControl';

export type PeriodDays = 7 | 30 | 90;

const PERIOD_OPTIONS: SegmentOption<PeriodDays>[] = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

interface ToolbarProps {
  title: string;
  period: PeriodDays;
  onPeriodChange: (days: PeriodDays) => void;
  onAuthClick?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, period, onPeriodChange, onAuthClick }) => {
  return (
    <header className="glass-nav toolbar-container" role="banner">
      <h1 className="toolbar-title">{title}</h1>

      <div className="toolbar-actions">
        <SegmentedControl<PeriodDays>
          value={period}
          options={PERIOD_OPTIONS}
          onChange={onPeriodChange}
          ariaLabel="Filtro de período"
        />

        {onAuthClick && (
          <button
            type="button"
            aria-label="Autenticação e Chave"
            onClick={onAuthClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--hig-bg-card)',
              color: 'var(--hig-text-primary)',
              border: '1px solid var(--hig-border)',
              borderRadius: 'var(--hig-radius-sm)',
              boxShadow: 'var(--hig-shadow-sm)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Token Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
