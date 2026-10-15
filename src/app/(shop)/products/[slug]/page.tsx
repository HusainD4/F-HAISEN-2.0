'use client';
// ============================================================
// src/app/(shop)/products/[slug]/page.tsx
// Halaman Detail Produk — Deskripsi, Spek, Tambah ke Cart & Beli Langsung
// ============================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Shield,
  Download,
  Package,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use_auth';
import { useCart } from '@/hooks/use_cart';
import { toast } from '@/components/ui/toast';
import { formatRupiah, formatProductType } from '@/utils/formatters';
import { fetchProductBySlug } from '@/services/product_api';
import type { Product } from '@/types/product';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        const data = await fetchProductBySlug(params.slug);
        if (isMounted) {
          setProduct(data || null);
        }
      } catch {
        if (isMounted) {
          setProduct(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Produk yang Anda cari tidak tersedia atau belum terdaftar di database.
        </p>
        <Link href="/products" className="inline-block mt-6">
          <Button variant="gold">Kembali ke Katalog</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${params.slug}`)}`);
      return;
    }
    addItem(product, quantity);
    toast.success(`${quantity}x "${product.name}" ditambahkan ke keranjang!`);
  };

  const handleDirectBuy = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk melanjutkan pembelian.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${params.slug}`)}`);
      return;
    }
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] mb-8">
        <Link href="/" className="hover:text-gold transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gold transition-colors">
          Produk
        </Link>
        <span>/</span>
        <span className="text-[var(--text)] font-medium truncate max-w-xs">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Left Column: Overview & Details ───────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Main Info Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gold/15 text-gold-600 dark:text-gold border border-gold/30">
                {formatProductType(product.product_type)}
              </span>
              {product.category && (
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  Kategori: {product.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text)] leading-tight">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-3 pb-6 border-b border-[var(--border)]">
              <span className="text-3xl sm:text-4xl font-extrabold text-gradient-gold">
                {formatRupiah(product.price)}
              </span>
              {product.product_type === 'digital' && (
                <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Unduh Langsung
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">
                Deskripsi Lengkap
              </h3>
              <div className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Product Type Specific Highlights */}
            {product.product_type === 'digital' && product.assets && product.assets.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Aset Yang Didapatkan ({product.assets.length} File)</span>
                </h3>
                <div className="space-y-2">
                  {product.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs sm:text-sm"
                    >
                      <span className="font-medium text-[var(--text)] truncate max-w-sm">
                        {asset.file_name}
                      </span>
                      <span className="text-[var(--text-muted)] shrink-0">
                        {(asset.file_size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Purchase Box (Sticky) ────────────────────── */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-[var(--bg-surface)] border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-gold/20 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-[var(--text)]">Ringkasan Pesanan</h3>

            <div>
              <span className="text-xs text-[var(--text-muted)] block mb-1">Harga Satuan</span>
              <span className="text-2xl font-bold text-gradient-gold">
                {formatRupiah(product.price)}
              </span>
            </div>

            {/* Quantity Selector (for physical or multi-license) */}
            {product.product_type === 'physical' && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text)]">Jumlah</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--text)] hover:border-gold"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold text-[var(--text)] w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--text)] hover:border-gold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Total Calculation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--text)]">Subtotal</span>
              <span className="text-xl font-bold text-[var(--text)]">
                {formatRupiah(product.price * quantity)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                variant="gold"
                fullWidth
                size="lg"
                onClick={handleDirectBuy}
                rightIcon={<Zap className="w-4 h-4" />}
              >
                Beli Sekarang
              </Button>
              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Tambah ke Keranjang
              </Button>
            </div>

            {/* Guarantee Pills */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold shrink-0" />
                <span>Transaksi Terenkripsi Midtrans</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                <span>Akses Otomatis 24 Jam Nonstop</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                <span>Garansi Resmi Haisen Official</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
