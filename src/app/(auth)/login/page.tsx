'use client';
// ============================================================
// src/app/(auth)/login/page.tsx
// Halaman Login Pengguna — Terproteksi CSRF & Rate Limit Backend
// ============================================================

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { GuestGuard } from '@/components/guards/guest_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use_auth';
import { loginSchema } from '@/utils/validators';
import { parseApiError } from '@/services/error_handler';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login(result.data);
      toast.success('Login berhasil! Selamat datang kembali.');
      router.replace(redirectTo);
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg shadow-black/5 dark:shadow-gold/5 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Haisen Official Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                Masuk ke Akun Anda
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                Akses pesanan, riwayat pembelian, dan unduhan digital Anda.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                value={form.email}
                error={errors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={form.password}
                  error={errors.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-gold hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                fullWidth
                loading={loading}
                rightIcon={<LogIn className="w-4 h-4" />}
              >
                Masuk Sekarang
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-gold hover:underline inline-flex items-center gap-1"
                >
                  Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
