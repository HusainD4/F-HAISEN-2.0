'use client';
// ============================================================
// src/app/(shop)/cart/page.tsx
// Halaman Keranjang Belanja — Ringkasan Item & Manajemen Kuantitas
// ============================================================

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/guards/auth_guard';
import { useCart } from '@/hooks/use_cart';
import { formatRupiah, formatProductType } from '@/utils/formatters';

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}

function CartContent() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    hasPhysicalItems,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Keranjang Belanja Anda Kosong
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md mx-auto">
          Anda belum menambahkan produk apa pun. Jelajahi katalog kami untuk menemukan produk digital atau layanan yang Anda butuhkan.
        </p>
        <div className="mt-8">
          <Link href="/products">
            <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Mulai Belanja
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Checkout Siap
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            Keranjang Belanja ({totalItems} item)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-medium text-red-500 hover:text-red-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Kosongkan Keranjang</span>
        </button>
      </div>

      {/* ── Notice: Physical items in cart ─────────────────────────── */}
      {hasPhysicalItems && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            <strong>Perhatian:</strong> Keranjang Anda berisi produk fisik. Pada tahap checkout, Anda akan diminta mengisi alamat pengiriman lengkap (provinsi, kota, kecamatan, kode pos) dan memilih kurir.
          </p>
        </div>
      )}

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Item List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-gold/40"
            >
              {/* Product Info */}
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                  {formatProductType(item.product_type)}
                </span>
                <h3 className="text-base font-bold text-[var(--text)] mt-2">
                  {item.name}
                </h3>
                <span className="text-sm font-semibold text-gradient-gold block mt-1">
                  {formatRupiah(item.price)}
                </span>
              </div>

              {/* Quantity Selector & Remove */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-[var(--border)]">
                {/* Quantity Controls (hanya untuk barang fisik atau jika relevan) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-gold"
                    aria-label="Kurangi kuantitas"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-[var(--text)] w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-gold"
                    aria-label="Tambah kuantitas"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal Item */}
                <span className="text-sm font-bold text-[var(--text)] min-w-[100px] text-right">
                  {formatRupiah(item.price * item.quantity)}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title="Hapus dari keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary Column ─────────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <div className="bg-[var(--bg-surface)] border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-gold/20 flex flex-col gap-6 sticky top-28">
            <h3 className="text-lg font-bold text-[var(--text)]">Ringkasan Biaya</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal ({totalItems} barang)</span>
                <span className="font-semibold text-[var(--text)]">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Pengiriman</span>
                <span className="font-semibold text-[var(--text)]">
                  {hasPhysicalItems ? 'Dihitung di checkout' : 'Gratis (Digital)'}
                </span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between text-base font-bold text-[var(--text)]">
                <span>Total Estimasi</span>
                <span className="text-xl text-gradient-gold">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              fullWidth
              onClick={() => router.push('/checkout')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Checkout
            </Button>

            <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                <span>Pembayaran resmi terhubung Midtrans</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold shrink-0" />
                <span>Pengiriman akses instan setelah verifikasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
