// ============================================================
// src/middleware.ts
// Next.js Edge Middleware
// 1. Injeksi Security Headers (CSP, HSTS, X-Frame-Options)
// 2. Route Protection berdasarkan token JWT in-cookie
// 3. Redirect logic: auth ↔ guest pages
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@/security/csp_headers';

// Routes yang WAJIB login
const PROTECTED_ROUTES = ['/dashboard', '/orders', '/downloads', '/checkout', '/profile'];

// Routes yang HANYA untuk yang BELUM login (guest)
const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes yang WAJIB role admin+
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── 1. Inject Security Headers ke semua response ────────
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // ── 2. Baca refresh token dari cookie (HttpOnly) ─────────
  // Access token ada di memori (client-side), middleware hanya bisa
  // cek keberadaan refresh token cookie sebagai sinyal "sudah login".
  const hasRefreshToken = request.cookies.has('refresh_token');

  // ── 3. Protected routes — redirect ke login jika tidak ada token ──
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Guest-only routes — redirect ke dashboard jika sudah login ──
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  if (isGuestOnly && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── 5. Admin routes — redirect ke home jika tidak ada token ─────
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdmin && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
  }

  // ── 6. Blokir akses langsung ke API routes internal ──────
  if (pathname.startsWith('/api/internal')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    // Jalankan middleware di semua route kecuali static files & Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)',
  ],
};
