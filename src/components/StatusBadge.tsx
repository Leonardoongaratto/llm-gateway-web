import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'fallback';

export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const renderDefaultIcon = (variant: StatusBadgeVariant) => {
  const commonProps = {
    width: 12,
    height: 12,
    viewBox: '0 0 16 16',
    'aria-hidden': 'true' as const,
    style: { flexShrink: 0 },
  };

  switch (variant) {
    case 'success':
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2.2 L14.5 13.5 L1.5 13.5 Z" strokeLinejoin="round" />
          <line x1="8" y1="6" x2="8" y2="9.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'danger':
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" strokeLinecap="round" />
          <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" strokeLinecap="round" />
        </svg>
      );
    case 'fallback':
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M2.5 5.5 h8 a2.5 2.5 0 0 1 2.5 2.5 v0 a2.5 2.5 0 0 1 -2.5 2.5 h-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline points="5.5 2.5 2.5 5.5 5.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'info':
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="7.5" x2="8" y2="11.5" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'neutral':
    default:
      return (
        <svg {...commonProps} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="4.5" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
  }
};

const VARIANT_STYLES: Record<StatusBadgeVariant, { color: string; bg: string; border: string }> = {
  success: {
    color: 'var(--hig-success)',
    bg: 'var(--hig-success-subtle)',
    border: 'var(--hig-success-subtle)',
  },
  warning: {
    color: 'var(--hig-warning)',
    bg: 'var(--hig-warning-subtle)',
    border: 'var(--hig-warning-subtle)',
  },
  danger: {
    color: 'var(--hig-danger)',
    bg: 'var(--hig-danger-subtle)',
    border: 'var(--hig-danger-subtle)',
  },
  fallback: {
    color: 'var(--hig-orange)',
    bg: 'var(--hig-orange-subtle)',
    border: 'var(--hig-orange-subtle)',
  },
  info: {
    color: 'var(--hig-accent)',
    bg: 'var(--hig-accent-subtle)',
    border: 'var(--hig-accent-subtle)',
  },
  neutral: {
    color: 'var(--hig-text-secondary)',
    bg: 'var(--hig-bg-grouped)',
    border: 'var(--hig-border)',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  icon,
  className = '',
  style,
  ariaLabel,
}) => {
  const vStyle = VARIANT_STYLES[variant];

  return (
    <span
      className={`hig-status-badge ${className}`.trim()}
      data-variant={variant}
      aria-label={ariaLabel || label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--hig-radius-pill)',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--hig-font-system)',
        lineHeight: 1.35,
        color: vStyle.color,
        backgroundColor: vStyle.bg,
        border: `1px solid ${vStyle.border}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style,
      }}
    >
      {icon ?? renderDefaultIcon(variant)}
      <span>{label}</span>
    </span>
  );
};
