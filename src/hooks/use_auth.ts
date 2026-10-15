'use client';
// ============================================================
// src/hooks/use_auth.ts
// Auth Hook — state autentikasi, login, logout, role & permission check
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import {
  setAccessToken,
  clearAccessToken,
  setRefreshToken,
  clearRefreshToken,
  hasActiveSession,
} from '@/security/token_manager';
import { loginUser, logoutUser, fetchCurrentUser } from '@/services/auth_api';
import { parseApiError } from '@/services/error_handler';
import type { User, LoginPayload, AuthState } from '@/types/auth';
import type { RoleSlug } from '@/config/constants';

// ── State Singleton (shared across hook instances) ───────────
let _authState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};
const _listeners = new Set<() => void>();

function setAuthState(next: Partial<AuthState>) {
  _authState = { ..._authState, ...next };
  _listeners.forEach((fn) => fn());
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const notify = () => rerender((n) => n + 1);
    _listeners.add(notify);
    return () => {
      _listeners.delete(notify);
    };
  }, []);

  /** Login: simpan access & refresh token, fetch profil user */
  const login = useCallback(async (payload: LoginPayload): Promise<void> => {
    setAuthState({ isLoading: true });
    try {
      const tokenPair = await loginUser(payload);
      setAccessToken(tokenPair.access_token);
      if (tokenPair.refresh_token) {
        setRefreshToken(tokenPair.refresh_token);
      }
      const user = await fetchCurrentUser();
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      clearAccessToken();
      clearRefreshToken();
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      throw err;
    }
  }, []);

  /** Logout: clear token memori + revoke cookie di backend */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutUser();
    } finally {
      clearAccessToken();
      clearRefreshToken();
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  /** Hydrate auth state: hanya panggil API jika memang ada sesi aktif */
  const hydrate = useCallback(async (): Promise<void> => {
    if (_authState.user) return; // sudah ada data user
    if (!hasActiveSession()) {
      // Tidak ada token, langsung tandai sebagai unauthenticated tanpa delay
      if (_authState.isLoading) {
        setAuthState({ isLoading: false });
      }
      return;
    }

    setAuthState({ isLoading: true });
    try {
      const user = await fetchCurrentUser();
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAccessToken();
      clearRefreshToken();
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  /** Cek apakah user memiliki role tertentu */
  const hasRole = useCallback(
    (...roles: RoleSlug[]): boolean => {
      const slug = _authState.user?.role?.slug;
      return slug ? roles.includes(slug) : false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_authState.user]
  );

  /** Cek apakah user memiliki permission code tertentu */
  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      const perms = _authState.user?.role?.permissions ?? [];
      return perms.includes(permissionCode);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_authState.user]
  );

  /** Update data user di state (setelah edit profil) */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const user = await fetchCurrentUser();
      setAuthState({ user });
    } catch {
      // silent
    }
  }, []);

  return {
    user: _authState.user,
    isAuthenticated: _authState.isAuthenticated,
    isLoading: _authState.isLoading,
    login,
    logout,
    hydrate,
    hasRole,
    hasPermission,
    refreshUser,
    parseApiError,
  };
}
