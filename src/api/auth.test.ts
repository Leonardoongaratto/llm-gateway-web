import { describe, expect, it, vi } from 'vitest';
import {
  clearAdminToken,
  getAdminToken,
  hasAdminToken,
  onAuthRequired,
  setAdminToken,
  triggerAuthRequired,
} from './auth';

describe('Auth Management (sessionStorage) (AC-2A-04, AC-2A-05 / F-03)', () => {
  it('stores and retrieves the admin token in sessionStorage', () => {
    expect(hasAdminToken()).toBe(false);
    expect(getAdminToken()).toBeNull();

    setAdminToken('lgw_admin_secret_123');

    expect(hasAdminToken()).toBe(true);
    expect(getAdminToken()).toBe('lgw_admin_secret_123');
    expect(sessionStorage.getItem('LGW_ADMIN_TOKEN')).toBe('lgw_admin_secret_123');
  });

  it('clears the admin token from sessionStorage', () => {
    setAdminToken('lgw_admin_secret_123');
    clearAdminToken();

    expect(hasAdminToken()).toBe(false);
    expect(getAdminToken()).toBeNull();
    expect(sessionStorage.getItem('LGW_ADMIN_TOKEN')).toBeNull();
  });

  it('triggers listeners when authentication is required', () => {
    const listener = vi.fn();
    const unsubscribe = onAuthRequired(listener);

    triggerAuthRequired();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    triggerAuthRequired();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
