'use client';
// ============================================================
// src/app/(shop)/products/page.tsx
// Katalog Produk Haisen Official — Digital, Jasa, & Fisik
// ============================================================

import React, { Suspense, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Code2,
  Briefcase,
  Package,
  ShoppingCart,
  Star,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use_auth';
import { useCart } from '@/hooks/use_cart';
import { useDebounce } from '@/hooks/use_debounce';
import { toast } from '@/components/ui/toast';
import { formatRupiah, formatProductType } from '@/utils/formatters';
import { fetchProducts, fetchCategories } from '@/services/product_api';
import type { Product, ProductCategory, ProductType } from '@/types/product';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const typeParam = (searchParams.get('type') as ProductType | null) ?? undefined;
  const searchParam = searchParams.get('search') ?? '';
  const categoryParam = searchParams.get('category') ?? '';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [selectedType, setSelectedType] = useState<ProductType | 'all'>(typeParam ?? 'all');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => setCategories([]));
  }, []);

  // Update URL params when filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType !== 'all') params.set('type', selectedType);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (page > 1) params.set('page', page.toString());

    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [selectedType, debouncedSearch, selectedCategory, page, router]);

  // Load products based on filters
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchProducts({
          product_type: selectedType === 'all' ? undefined : selectedType,
          search: debouncedSearch.trim() || undefined,
          category_id: selectedCategory || undefined,
          page,
          per_page: 9,
        });

        if (isMounted) {
          setProducts(res.items || []);
          setTotalItems(res.total ?? 0);
          setTotalPages(res.total_pages || 1);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedType, debouncedSearch, selectedCategory, page]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
      router.push(`/login?redirect=${encodeURIComponent('/products')}`);
      return;
    }
    addItem(product);
    toast.success(`"${product.name}" ditambahkan ke keranjang!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
          Katalog Haisen Official
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mt-1">
          Eksplorasi Semua Produk & Layanan
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
          Temukan solusi digital siap pakai, konsultasi jasa ahli, dan produk merchandise berkualitas tinggi.
        </p>
      </div>

      {/* ── Controls (Search + Type Tabs + Categories) ──────────────── */}
      <div className="flex flex-col gap-6 mb-10">
        {/* Search & Category Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Cari produk atau layanan..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {categories.length > 0 && (
            <div className="sm:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Product Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4">
          <button
            onClick={() => {
              setSelectedType('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'all'
                ? 'bg-gold text-charcoal-900 shadow-gold'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Semua Produk</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('digital');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'digital'
                ? 'bg-gold text-charcoal-900 shadow-gold'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Produk Digital</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('service');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'service'
                ? 'bg-gold text-charcoal-900 shadow-gold'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jasa & Layanan</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('physical');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'physical'
                ? 'bg-gold text-charcoal-900 shadow-gold'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Barang Fisik</span>
          </button>
        </div>
      </div>

      {/* ── Product Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 h-72 animate-pulse flex flex-col justify-between"
            >
              <div className="h-6 w-1/3 bg-[var(--border)] rounded mb-4" />
              <div className="h-4 w-3/4 bg-[var(--border)] rounded mb-2" />
              <div className="h-4 w-1/2 bg-[var(--border)] rounded" />
              <div className="h-10 w-full bg-[var(--border)] rounded mt-6" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)]">
          <Layers className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text)]">Tidak ada produk ditemukan</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Coba ubah kata kunci pencarian atau ganti filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between hover:border-gold/50 transition-all duration-300 hover:shadow-gold"
            >
              <div>
                {/* Header Type & Category */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/15 text-gold-600 dark:text-gold border border-gold/30">
                    {formatProductType(item.product_type)}
                  </span>
                  {item.product_type === 'physical' && item.stock !== null && (
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      Stok: {item.stock}
                    </span>
                  )}
                  {item.product_type !== 'physical' && (
                    <span className="text-[11px] text-emerald-500 font-medium">
                      Akses Instan
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link href={`/products/${item.slug}`}>
                  <h4 className="text-lg font-bold text-[var(--text)] group-hover:text-gold transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                </Link>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Pricing & Actions */}
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

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Sebelumnya
          </Button>
          <span className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
