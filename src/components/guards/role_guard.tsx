'use client';
// ============================================================
// src/components/guards/role_guard.tsx
// Blokir akses berdasarkan role — tampilkan 403 jika tidak punya akses
// ============================================================

import { useAuth } from '@/hooks/use_auth';
import type { RoleSlug } from '@/config/constants';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Role yang diizinkan masuk */
  allowedRoles: RoleSlug[];
  /** Fallback jika tidak punya akses (default: halaman 403) */
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasRole(...allowedRoles)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldOff size={28} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--text)]">Akses Ditolak</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
