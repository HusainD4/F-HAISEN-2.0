// ============================================================
// src/services/api_client.ts
// Hardened Axios Instance
// - Inject Bearer Token otomatis dari in-memory token_manager
// - Auto-refresh token saat 401 via refresh_token
// - Anti-Infinite Loop: Tidak ada hard redirect window.location
// ============================================================

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { env } from '@/config/env';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from '@/security/token_manager';
import { getCsrfHeaders } from '@/security/csrf';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/** Singleton Axios instance */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 8000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Inject Bearer Token dari memory
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject CSRF header untuk mutating requests
  if (config.method && MUTATING_METHODS.has(config.method.toLowerCase())) {
    Object.assign(config.headers, getCsrfHeaders());
  }

  return config;
});

// ── Response Interceptor ─────────────────────────────────────
let _isRefreshing = false;
let _failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  _failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Jika bukan error 401 atau request config tidak ada atau sudah pernah di-retry
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Hindari refresh loop untuk endpoint autentikasi
    const url = original.url ?? '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    // Jika tidak ada refresh token tersimpan, jangan coba refresh
    if (!refreshToken) {
      clearAccessToken();
      return Promise.reject(error);
    }

    // Jika refresh sedang berlangsung, antri
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    _isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { timeout: 8000 }
      );

      const tokenData = data.data ?? data;
      const newAccessToken: string = tokenData.access_token;
      const newRefreshToken: string | undefined = tokenData.refresh_token;

      if (!newAccessToken) {
        throw new Error('Invalid token response');
      }

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      processQueue(null, newAccessToken);
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAccessToken();
      clearRefreshToken();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  }
);
