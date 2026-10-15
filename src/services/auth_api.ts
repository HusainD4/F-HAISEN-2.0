// ============================================================
// src/services/auth_api.ts
// Auth API — Login, Register, Logout, Refresh, Me, Reset Password
// ============================================================

import { apiClient } from './api_client';
import { getRefreshToken } from '@/security/token_manager';
import type { User, LoginPayload, RegisterPayload, TokenPair } from '@/types/auth';

/** Login — response: access_token, refresh_token */
export async function loginUser(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await apiClient.post('/auth/login', payload);
  const res = data.data ?? data;
  return {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
    token_type: res.token_type ?? 'bearer',
  };
}

/** Register akun baru */
export async function registerUser(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post('/auth/register', payload);
  const user = data.data?.user ?? data.user ?? data.data ?? data;
  return user as User;
}

/** Logout — revoke refresh token di backend */
export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } catch {
      // Abaikan error jaringan saat logout
    }
  }
}

/** Ambil data user yang sedang login */
export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get('/auth/me');
  const user = data.data?.user ?? data.user ?? data.data ?? data;
  return user as User;
}

/** Request link reset password */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

/** Reset password dengan token dari email */
export async function resetPassword(token: string, new_password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, new_password });
}
