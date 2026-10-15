'use client';
// ============================================================
// src/app/page.tsx
// Homepage Haisen Official — Solusi Digital Terintegrasi
// ============================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Briefcase,
  Package,
  ShieldCheck,
  Zap,
  Headphones,
  CheckCircle2,
  ShoppingCart,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use_cart';
import { toast } from '@/components/ui/toast';
import { formatRupiah, formatProductType } from '@/utils/formatters';
import { fetchProducts } from '@/services/product_api';
import type { Product, ProductType } from '@/types/product';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use_auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFeaturedProducts() {
      try {
        const res = await fetchProducts({ limit: 6, featured: true });
        if (isMounted) {
          if (res && res.items && res.items.length > 0) {
            setProducts(res.items);
          } else {
            // Coba ambil semua produk jika belum ada yang diset featured
            const allRes = await fetchProducts({ limit: 6 });
            if (isMounted && allRes && allRes.items) {
              setProducts(allRes.items);
            }
          }
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadFeaturedProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Silakan masuk (login) terlebih dahulu untuk mulai belanja.');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    addItem(product);
    toast.success(`"${product.name}" ditambahkan ke keranjang!`);
  };

  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gold/15 dark:bg-gold/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-600 dark:text-gold text-xs sm:text-sm font-medium tracking-wide mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Platform Resmi Produk Digital & Layanan Profesional</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text)] max-w-4xl leading-[1.15]">
            Solusi Digital, Jasa Kreatif & Produk Resmi dalam{' '}
            <span className="text-gradient-gold">Satu Ekosistem</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Dapatkan source code teruji, template premium, konsultasi pengembangan sistem profesional,
            serta merchandise resmi langsung dari <strong className="text-[var(--text)]">Haisen Official</strong>.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/products">
              <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Jelajahi Katalog
              </Button>
            </Link>
            <Link href="/products?type=service">
              <Button variant="secondary" size="lg" leftIcon={<Briefcase className="w-4 h-4" />}>
                Layanan & Jasa
              </Button>
            </Link>
          </div>

          {/* Trust Metric Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[var(--border)] w-full max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl font-bold text-gradient-gold">100%</span>
              <span className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Terverifikasi & Aman</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl font-bold text-gradient-gold">Instant</span>
              <span className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Pengiriman Digital</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl font-bold text-gradient-gold">24/7</span>
              <span className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Sistem Otomatis</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl font-bold text-gradient-gold">Official</span>
              <span className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Garansi Layanan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Kategori Unggulan ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gold mb-2">
            Pilihan Kategori
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Penuhi Semua Kebutuhan Proyek Anda
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Pilih jenis produk atau layanan yang sesuai dengan tahapan bisnis dan kreativitas Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Produk Digital */}
          <Link
            href="/products?type=digital"
            className="group relative p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-gold/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal-900 transition-colors">
                <Code2 className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 mb-3">
                Download Instan
              </div>
              <h4 className="text-xl font-bold text-[var(--text)] group-hover:text-gold transition-colors">
                Produk Digital
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Source code web & mobile, template UI/UX Figma, e-book, dan script otomatisasi siap pakai.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-semibold text-gold gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Lihat Produk Digital</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Jasa & Layanan */}
          <Link
            href="/products?type=service"
            className="group relative p-8 rounded-2xl bg-[var(--bg-surface)] border border-gold/40 shadow-gold/20 hover:border-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-gold-lg flex flex-col justify-between"
          >
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold text-charcoal-900 shadow-sm">
                Populer
              </span>
            </div>
            <div>
              <div className="w-14 h-14 rounded-xl bg-gold text-charcoal-900 flex items-center justify-center mb-6 group-hover:bg-gold-400 transition-colors shadow-gold">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 mb-3">
                Kustom & Garansi
              </div>
              <h4 className="text-xl font-bold text-[var(--text)] group-hover:text-gold transition-colors">
                Jasa & Layanan
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Pengembangan web kustom, perancangan sistem aplikasi, desain identitas brand, dan audit keamanan.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-semibold text-gold gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Konsultasi Jasa</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Produk Fisik */}
          <Link
            href="/products?type=physical"
            className="group relative p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-gold/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-charcoal-900 transition-colors">
                <Package className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 mb-3">
                Kirim Seluruh RI
              </div>
              <h4 className="text-xl font-bold text-[var(--text)] group-hover:text-gold transition-colors">
                Barang & Merchandise
              </h4>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Apparel developer eksklusif, aksesoris workspace premium, dan hardware kit resmi Haisen Official.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-semibold text-gold gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Lihat Produk Fisik</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. Featured Showcase ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gold mb-1">
              Katalog Unggulan
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
              Produk & Layanan Terpopuler
            </h3>
          </div>
          <Link href="/products" className="text-sm font-semibold text-gold hover:underline flex items-center gap-1">
            Lihat Semua Produk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Cards / Empty State */}
        {!isLoading && products.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[var(--text)]">Belum Ada Produk Ditampilkan</h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mt-1.5 leading-relaxed">
              Katalog resmi produk sedang diperbarui. Silakan hubungi admin atau periksa kembali dalam waktu dekat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 h-72 animate-pulse flex flex-col justify-between"
                  >
                    <div className="h-6 w-1/3 bg-[var(--border)] rounded mb-4" />
                    <div className="h-4 w-3/4 bg-[var(--border)] rounded mb-2" />
                    <div className="h-4 w-1/2 bg-[var(--border)] rounded" />
                    <div className="h-10 w-full bg-[var(--border)] rounded mt-6" />
                  </div>
                ))
              : products.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between hover:border-gold/50 transition-all duration-300 hover:shadow-gold"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/15 text-gold-600 dark:text-gold border border-gold/30">
                        {formatProductType(item.product_type)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold">5.0</span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/products/${item.slug}`}>
                      <h4 className="text-lg font-bold text-[var(--text)] group-hover:text-gold transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                    </Link>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">
                        Harga
                      </span>
                      <span className="text-base sm:text-lg font-bold text-gradient-gold">
                        {formatRupiah(item.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleAddToCart(e, item)}
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Link href={`/products/${item.slug}`}>
                        <Button variant="gold" size="sm">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* ── 4. Value Propositions ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">Pembayaran Midtrans Terenkripsi</h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Dukung QRIS, GoPay, ShopeePay, Transfer Bank (BCA, Mandiri, BNI, BRI) dengan verifikasi otomatis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">Pengiriman Digital Instan</h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Setelah verifikasi pembayaran lunas, link unduhan produk langsung tersedia di akun pembeli.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">Dukungan Teknis Siap Bantu</h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Konsultasikan kebutuhan kustom atau pertanyaan integrasi langsung ke tim Haisen Official.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Banner CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 border border-gold/40 p-8 sm:p-14 text-center flex flex-col items-center shadow-gold">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kemitraan & Layanan Terpercaya</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white max-w-2xl leading-tight">
            Punya Ide Proyek atau Butuh Layanan Kustom?
          </h3>
          <p className="mt-4 text-sm sm:text-base text-charcoal-300 max-w-xl">
            Diskusikan kebutuhan spesifikasi software, sistem web terpadu, atau pemesanan skala besar bersama kami.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Haisen%20Official,%20saya%20tertarik%20dengan%20layanan%20Anda"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="gold" size="lg" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Hubungi via WhatsApp
              </Button>
            </a>
            <Link href="/products">
              <Button variant="secondary" size="lg" className="text-white border-white/20 hover:border-gold hover:text-gold">
                Lihat Semua Produk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
