// ============================================================
// src/services/user_api.ts
// User API — Profil & Admin User Management
// ============================================================

import { apiClient } from './api_client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { User } from '@/types/auth';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postal_code?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

/** Ambil profil user yang sedang login */
export async function fetchMyProfile(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/me');
  return data.data;
}

/** Update profil user yang sedang login */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.put<ApiResponse<User>>('/users/me', payload);
  return data.data;
}

/** Ganti password user yang sedang login */
export async function changeMyPassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post('/users/me/change-password', payload);
}

// ── Admin ────────────────────────────────────────────────────

/** [Admin] Ambil semua user */
export async function fetchAllUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params });
  return data;
}

/** [Admin] Ambil detail satu user */
export async function fetchUserById(userId: string): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
  return data.data;
}

/** [Admin] Update role atau status user */
export async function updateUser(
  userId: string,
  payload: { role_id?: string; is_active?: boolean }
): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${userId}`, payload);
  return data.data;
}
