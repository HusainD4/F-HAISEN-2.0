// ============================================================
// src/security/csp_headers.ts
// Content Security Policy helper (Next.js middleware integration)
// ============================================================

const isDev = process.env.NODE_ENV !== 'production';

export const CSP_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://app.sandbox.midtrans.com https://app.midtrans.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://evfafqohymlnffieyntt.supabase.co",
  `connect-src 'self' ${isDev ? 'ws: wss: http://localhost:* http://127.0.0.1:*' : ''} https://store.haisen.my.id http://localhost:8000 https://evfafqohymlnffieyntt.supabase.co`,
  "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_POLICY,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(isDev ? {} : { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' }),
};
