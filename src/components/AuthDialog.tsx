import React, { useEffect, useRef, useState } from 'react';
import { getAdminToken, setAdminToken } from '../api/auth';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthDialogModal: React.FC<Pick<AuthDialogProps, 'onClose' | 'onSuccess'>> = ({
  onClose,
  onSuccess,
}) => {
  const [tokenInput, setTokenInput] = useState(() => getAdminToken() ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setErrorMessage('Por favor, informe uma chave válida.');
      return;
    }

    setIsValidating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/admin/summary?days=7', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (res.status === 401 || res.status === 403) {
        setErrorMessage('Chave inválida ou não autorizada pelo servidor.');
        setIsValidating(false);
        return;
      }
      setAdminToken(trimmed);
      onSuccess();
      onClose();
    } catch {
      setAdminToken(trimmed);
      onSuccess();
      onClose();
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-dialog-title"
      ref={dialogRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--hig-bg-card)',
          borderRadius: 'var(--hig-radius-lg)',
          boxShadow: 'var(--hig-shadow-lg)',
          border: '1px solid var(--hig-border)',
          padding: '24px',
          color: 'var(--hig-text-primary)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            id="auth-dialog-title"
            style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '8px' }}
          >
            Autenticação Administrativa
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--hig-text-secondary)', lineHeight: 1.4 }}>
            Insira o <strong>LGW_ADMIN_TOKEN</strong> para desbloquear a auditoria e as métricas do painel
            executivo. A chave é salva apenas na sua sessão atual (sessionStorage).
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="admin-token-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--hig-text-secondary)',
                marginBottom: '6px',
              }}
            >
              Chave de Acesso
            </label>
            <input
              id="admin-token-input"
              ref={inputRef}
              type="password"
              placeholder="Ex: lgw_admin_live_..."
              value={tokenInput}
              disabled={isValidating}
              onChange={(e) => {
                setTokenInput(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'var(--hig-font-mono)',
                backgroundColor: 'var(--hig-bg-app)',
                color: 'var(--hig-text-primary)',
                border: '1px solid var(--hig-border-strong)',
                borderRadius: 'var(--hig-radius-sm)',
              }}
            />
            {errorMessage && (
              <p style={{ color: 'var(--hig-danger)', fontSize: '12px', marginTop: '6px' }}>{errorMessage}</p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isValidating}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: 'var(--hig-text-primary)',
                border: '1px solid var(--hig-border)',
                borderRadius: 'var(--hig-radius-sm)',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isValidating}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--hig-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--hig-radius-sm)',
                cursor: isValidating ? 'wait' : 'pointer',
              }}
            >
              {isValidating ? 'Validando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  return <AuthDialogModal onClose={onClose} onSuccess={onSuccess} />;
};
