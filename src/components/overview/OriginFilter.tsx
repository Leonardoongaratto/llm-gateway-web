import React from 'react';

export type OriginFilterType = 'all' | 'gateway' | 'claudecode' | 'org';

export interface OriginFilterProps {
  value: OriginFilterType;
  onChange: (origin: OriginFilterType) => void;
  className?: string;
}

const ORIGINS: { id: OriginFilterType; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'gateway', label: 'Gateway' },
  { id: 'claudecode', label: 'Claude Code' },
  { id: 'org', label: 'Organização' },
];

export const OriginFilter: React.FC<OriginFilterProps> = ({ value, onChange, className = '' }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Filtro de Origem"
      className={`origin-filter-segmented ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--hig-fill-secondary, rgba(120, 120, 128, 0.12))',
        borderRadius: 'var(--hig-radius-md, 8px)',
        padding: '2px',
        gap: '2px',
      }}
    >
      {ORIGINS.map((origin) => {
        const isSelected = value === origin.id;

        return (
          <button
            key={origin.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(origin.id)}
            style={{
              border: 'none',
              background: isSelected ? 'var(--hig-bg-card, #ffffff)' : 'transparent',
              color: isSelected ? 'var(--hig-text-primary)' : 'var(--hig-text-secondary)',
              boxShadow: isSelected ? 'var(--hig-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.08))' : 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: isSelected ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
          >
            {origin.label}
          </button>
        );
      })}
    </div>
  );
};
