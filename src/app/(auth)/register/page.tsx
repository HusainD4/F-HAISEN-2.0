'use client';
// ============================================================
// src/app/(auth)/register/page.tsx
// Halaman Pendaftaran Akun Baru Haisen Official
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';
import { GuestGuard } from '@/components/guards/guest_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { registerSchema } from '@/utils/validators';
import { registerUser } from '@/services/auth_api';
import { parseApiError } from '@/services/error_handler';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
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
      await registerUser({
        full_name: result.data.full_name,
        email: result.data.email,
        password: result.data.password,
        phone: result.data.phone || undefined,
      });

      toast.success('Pendaftaran akun berhasil! Silakan masuk.');
      router.push('/login');
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg shadow-black/5 dark:shadow-gold/5 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Gabung Bersama Kami
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                Buat Akun Baru
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                Daftarkan diri Anda untuk kemudahan transaksi dan akses produk digital.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="Contoh: Budi Santoso"
                required
                leftIcon={<User className="w-4 h-4" />}
                value={form.full_name}
                error={errors.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                autoComplete="name"
              />

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

              <Input
                label="Nomor WhatsApp / HP (Opsional)"
                type="tel"
                placeholder="08123456789"
                leftIcon={<Phone className="w-4 h-4" />}
                value={form.phone}
                error={errors.phone}
                hint="Dibutuhkan untuk notifikasi pesanan dan pengiriman barang fisik"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter (huruf besar & angka)"
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={form.password}
                  error={errors.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
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

              <Input
                label="Konfirmasi Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ulangi password Anda"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                value={form.confirm_password}
                error={errors.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  fullWidth
                  loading={loading}
                  rightIcon={<UserPlus className="w-4 h-4" />}
                >
                  Daftar Sekarang
                </Button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Sudah memiliki akun?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-gold hover:underline inline-flex items-center gap-1"
                >
                  Masuk di sini <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
