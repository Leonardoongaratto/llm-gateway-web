import React from 'react';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel = 'Seletor de período',
}: SegmentedControlProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      const nextOpt = options[nextIndex];
      if (nextOpt) onChange(nextOpt.value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      const prevOpt = options[prevIndex];
      if (prevOpt) onChange(prevOpt.value);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        backgroundColor: 'var(--hig-bg-grouped)',
        borderRadius: 'var(--hig-radius-sm)',
        border: '1px solid var(--hig-border)',
      }}
    >
      {options.map((opt, index) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: isSelected ? 600 : 400,
              fontFamily: 'var(--hig-font-system)',
              color: isSelected ? 'var(--hig-text-primary)' : 'var(--hig-text-secondary)',
              backgroundColor: isSelected ? 'var(--hig-bg-card)' : 'transparent',
              boxShadow: isSelected ? 'var(--hig-shadow-sm)' : 'none',
              border: 'none',
              borderRadius: 'var(--hig-radius-xs)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
