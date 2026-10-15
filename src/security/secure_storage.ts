// ============================================================
// src/security/secure_storage.ts
// Encrypted localStorage untuk data non-sensitif (cart, preferensi).
// Token JWT TIDAK boleh disimpan di sini — gunakan token_manager.ts.
// Enkripsi: XOR sederhana dengan fingerprint browser (bukan kriptografi kuat,
// cukup untuk mencegah pembacaan plain-text oleh ekstensi/script nakal).
// ============================================================

const STORAGE_PREFIX = 'hso_'; // haisen store

/** Buat key enkripsi sederhana dari User-Agent + origin. */
function getDerivedKey(): string {
  if (typeof window === 'undefined') return 'ssr';
  return btoa(`${navigator.userAgent}${window.location.origin}`).slice(0, 16);
}

function xorEncode(data: string, key: string): string {
  return data
    .split('')
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

function encode(value: unknown): string {
  const json = JSON.stringify(value);
  const key = getDerivedKey();
  const encoded = xorEncode(json, key);
  return btoa(encoded);
}

function decode<T>(raw: string): T | null {
  try {
    const key = getDerivedKey();
    const decoded = xorEncode(atob(raw), key);
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

/** Simpan data ke localStorage dengan enkripsi ringan. */
export function secureSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, encode(value));
  } catch {
    // localStorage penuh atau disabled — silent fail
  }
}

/** Ambil data dari localStorage dan dekripsi. */
export function secureGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return decode<T>(raw);
  } catch {
    return null;
  }
}

/** Hapus item dari localStorage. */
export function secureRemove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/** Hapus semua item dengan prefix toko dari localStorage. */
export function secureClearAll(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

/** Key konstanta yang digunakan di seluruh app */
export const STORAGE_KEYS = {
  CART: 'cart',
  THEME: 'theme',
} as const;
