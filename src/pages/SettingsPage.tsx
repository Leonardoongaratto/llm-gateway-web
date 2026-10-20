import React, { useEffect, useState } from 'react';
import { clearAdminToken, getAdminToken, setAdminToken } from '../api/auth';
import { fetchHealth } from '../api/client';
import type { HealthResponse } from '../api/types';

export const SettingsPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState(() => getAdminToken() || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((res) => {
        if (!active) return;
        setHealth(res);
      })
      .catch(() => {
        if (!active) return;
        setHealth({ status: 'unreachable' });
      })
      .finally(() => {
        if (!active) return;
        setLoadingHealth(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminToken(tokenInput.trim());
    setSaveMessage('Chave salva na sessão com sucesso.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleClear = () => {
    clearAdminToken();
    setTokenInput('');
    setSaveMessage('Chave removida da sessão.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div className="hig-card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          Autenticação Administrativa
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginBottom: '16px' }}>
          Configure o <strong>LGW_ADMIN_TOKEN</strong> para desbloquear relatórios agregados e dados
          financeiros.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="password"
              placeholder="Ex: lgw_admin_live_..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                fontFamily: 'var(--hig-font-mono)',
                backgroundColor: 'var(--hig-bg-grouped)',
                color: 'var(--hig-text-primary)',
                border: '1px solid var(--hig-border)',
                borderRadius: 'var(--hig-radius-sm)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--hig-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--hig-radius-sm)',
                cursor: 'pointer',
              }}
            >
              Salvar Chave
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: 'var(--hig-danger)',
                border: '1px solid var(--hig-border)',
                borderRadius: 'var(--hig-radius-sm)',
                cursor: 'pointer',
              }}
            >
              Limpar Chave
            </button>
          </div>

          {saveMessage && (
            <p style={{ color: 'var(--hig-success)', fontSize: '12px', marginTop: '10px', fontWeight: 500 }}>
              {saveMessage}
            </p>
          )}
        </form>
      </div>

      <div className="hig-card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          Conectividade com o Edge Proxy
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', marginBottom: '16px' }}>
          Status da conexão local com o backend (:8787).
        </p>

        {loadingHealth ? (
          <p style={{ fontSize: '13px', color: 'var(--hig-text-tertiary)' }}>Verificando conexão...</p>
        ) : health?.status === 'ok' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hig-success)' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--hig-success)',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Backend e Microsserviços Online</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hig-warning)' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--hig-warning)',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Backend Indisponível ou em Dev Offline</span>
          </div>
        )}
      </div>
    </div>
  );
};
