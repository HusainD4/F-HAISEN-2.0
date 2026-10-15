// ============================================================
// src/security/csrf.ts
// CSRF Header Helper
// Backend FastAPI menggunakan double-submit cookie pattern.
// Header X-Requested-With dikirim di setiap mutating request.
// ============================================================

/** Nama header CSRF yang diharapkan backend */
export const CSRF_HEADER = 'X-Requested-With' as const;
export const CSRF_VALUE = 'XMLHttpRequest' as const;

/**
 * Return objek header CSRF untuk disertakan di setiap request
 * yang bersifat mutating (POST, PUT, PATCH, DELETE).
 */
export function getCsrfHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER]: CSRF_VALUE,
  };
}
