// ============================================================
// src/types/auth.ts
// Auth, User Session & Role Types
// ============================================================

/** Role yang tersedia di sistem */
export type UserRole = 'superadmin' | 'admin' | 'finance' | 'staff' | 'user';

/** Data profil user dari backend */
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  // Alamat pengiriman (Indonesia)
  address: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  role: {
    id: string;
    name: string;
    slug: UserRole;
    permissions: string[]; // array of permission codes
  } | null;
  created_at: string;
}

/** Payload untuk login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload untuk register */
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  // Opsional saat register, wajib diisi saat checkout produk fisik
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postal_code?: string;
}

/** Token pair dari backend */
export interface TokenPair {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

/** State auth di memory */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
