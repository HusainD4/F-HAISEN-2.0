'use client';
// ============================================================
// src/components/guards/guest_guard.tsx
// Mencegah user yang sudah login mengakses halaman /login & /register
// ============================================================

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use_auth';

interface GuestGuardProps {
  children: React.ReactNode;
}

function GuestGuardInner({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading, hydrate } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect ke halaman asal jika ada, atau ke dashboard
      const redirectTo = searchParams.get('redirect') ?? '/dashboard';
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <>{children}</>;
}

export function GuestGuard({ children }: GuestGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GuestGuardInner>{children}</GuestGuardInner>
    </Suspense>
  );
}
