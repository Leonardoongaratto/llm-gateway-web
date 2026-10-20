import React from 'react';

interface ErrorBannerProps {
  message: string;
  status?: number;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, status, onRetry }) => {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--hig-danger-subtle)',
        border: '1px solid var(--hig-danger)',
        borderRadius: 'var(--hig-radius-md)',
        padding: '16px 20px',
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        color: 'var(--hig-text-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            color: 'var(--hig-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div>
          {status && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--hig-danger)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '2px',
              }}
            >
              Erro {status}
            </span>
          )}
          <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'var(--hig-bg-card)',
            color: 'var(--hig-text-primary)',
            border: '1px solid var(--hig-border)',
            borderRadius: 'var(--hig-radius-sm)',
            boxShadow: 'var(--hig-shadow-sm)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
};
