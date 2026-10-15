// ============================================================
// src/security/token_manager.ts
// In-Memory JWT Access Token Store + Session Cookie Management
// ============================================================

let _accessToken: string | null = null;
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Simpan access token di memori runtime. */
export function setAccessToken(token: string): void {
  _accessToken = token;
}

/** Ambil access token dari memori. */
export function getAccessToken(): string | null {
  return _accessToken;
}

/** Hapus access token dari memori. */
export function clearAccessToken(): void {
  _accessToken = null;
}

/** Cek apakah access token ada di memori. */
export function hasAccessToken(): boolean {
  return _accessToken !== null;
}

/** Simpan refresh token di cookie agar dibaca Middleware Next.js */
export function setRefreshToken(token: string): void {
  if (typeof document === 'undefined') return;
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
}

/** Ambil refresh token dari cookie browser */
export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${REFRESH_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/** Hapus refresh token cookie */
export function clearRefreshToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Cek apakah user memiliki sesi aktif */
export function hasActiveSession(): boolean {
  return hasAccessToken() || Boolean(getRefreshToken());
}

/**
 * Decode payload JWT tanpa verifikasi signature (client-side only).
 */
export function decodeTokenPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Cek apakah token sudah expired berdasarkan claim `exp`. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
