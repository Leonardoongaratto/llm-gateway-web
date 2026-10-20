import React, { useState } from 'react';

const DEFAULT_CURL_SAMPLE = `curl -X POST http://127.0.0.1:8787/v1/chat/completions \\
  -H "Authorization: Bearer lgw_live_demo" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-3-7-sonnet",
    "messages": [{"role": "user", "content": "Olá LLM Gateway"}]
  }'`;

interface EmptyStateProps {
  title?: string;
  description?: string;
  curlCommand?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum dado registrado ainda neste período',
  description = 'O gateway está pronto para rotear suas requisições de IA. Faça a primeira chamada para visualizar métricas, modelos e consumo em tempo real.',
  curlCommand = DEFAULT_CURL_SAMPLE,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      return;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--hig-bg-card)',
        borderRadius: 'var(--hig-radius-lg)',
        border: '1px solid var(--hig-border)',
        padding: '36px 24px',
        maxWidth: '680px',
        margin: '32px auto',
        textAlign: 'center',
        boxShadow: 'var(--hig-shadow-sm)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--hig-radius-pill)',
          backgroundColor: 'var(--hig-bg-grouped)',
          color: 'var(--hig-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 17 4 4 4-4" />
        </svg>
      </div>

      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--hig-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--hig-text-secondary)',
          lineHeight: 1.5,
          maxWidth: '520px',
          margin: '0 auto 24px auto',
        }}
      >
        {description}
      </p>

      <div
        style={{
          textAlign: 'left',
          backgroundColor: 'var(--hig-bg-grouped)',
          borderRadius: 'var(--hig-radius-md)',
          border: '1px solid var(--hig-border)',
          padding: '14px 16px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--hig-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Exemplo cURL
          </span>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              backgroundColor: copied ? 'var(--hig-success-subtle)' : 'var(--hig-bg-card)',
              color: copied ? 'var(--hig-success)' : 'var(--hig-text-primary)',
              border: '1px solid var(--hig-border)',
              borderRadius: 'var(--hig-radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? 'Copiado!' : 'Copiar cURL'}
          </button>
        </div>

        <pre
          style={{
            fontFamily: 'var(--hig-font-mono)',
            fontSize: '12px',
            color: 'var(--hig-text-primary)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: 1.45,
          }}
        >
          {curlCommand}
        </pre>
      </div>
    </div>
  );
};
