'use client';
// ============================================================
// src/app/(auth)/forgot-password/page.tsx
// Halaman Lupa Password — Kirim Instruksi Reset ke Email
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { GuestGuard } from '@/components/guards/guest_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { forgotPasswordSchema } from '@/utils/validators';
import { forgotPassword } from '@/services/auth_api';
import { parseApiError } from '@/services/error_handler';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Permintaan reset password telah dikirim.');
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
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-lg shadow-black/5 dark:shadow-gold/5 relative overflow-hidden">
            {isSubmitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                  Cek Email Anda
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Jika email <strong className="text-[var(--text)]">{email}</strong> terdaftar, kami telah mengirimkan instruksi dan tautan untuk mengatur ulang password akun Anda.
                </p>
                <Link href="/login">
                  <Button variant="gold" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Kembali ke Halaman Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Pemulihan Akun
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
                    Lupa Password?
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                    Masukkan alamat email yang terdaftar untuk menerima tautan pemulihan kata sandi.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <Input
                    label="Email Terdaftar"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={email}
                    error={error}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    variant="gold"
                    fullWidth
                    loading={loading}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Kirim Link Pemulihan
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                  <Link
                    href="/login"
                    className="text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-gold transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
