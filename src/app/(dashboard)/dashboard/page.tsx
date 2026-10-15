'use client';
// ============================================================
// src/app/(dashboard)/dashboard/page.tsx
// Dashboard Pengguna — Ringkasan Akun, Pesanan Aktif, Unduhan
// ============================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Package,
} from 'lucide-react';
import { AuthGuard } from '@/components/guards/auth_guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use_auth';
import { fetchMyOrders } from '@/services/order_api';
import { formatRupiah, formatDate, formatOrderStatus } from '@/utils/formatters';
import type { Order } from '@/types/order';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetchMyOrders(1, 5);
        if (isMounted && res.items) {
          setOrders(res.items);
        }
      } catch {
        // graceful empty
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'completed');

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Welcome Header ────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Panel Pelanggan
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
              Halo, {user?.full_name || 'Pelanggan'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Kelola riwayat belanja, unduhan file digital, dan status transaksi Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Belanja Lagi
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Quick Stats Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--text-muted)] font-medium block">
                Total Transaksi
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1 block">
                {orders.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--text-muted)] font-medium block">
                Menunggu Pembayaran
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1 block">
                {pendingOrders.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--text-muted)] font-medium block">
                Transaksi Lunas
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-500 mt-1 block">
                {paidOrders.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── Recent Orders Section ─────────────────────────────────── */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)]">Pesanan Terbaru</h2>
            <Link
              href="/orders"
              className="text-xs sm:text-sm font-semibold text-gold hover:underline flex items-center gap-1"
            >
              Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Belum ada transaksi belanja.</p>
              <Link href="/products" className="inline-block mt-4">
                <Button variant="secondary" size="sm">
                  Jelajahi Produk
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => {
                const statusMeta = formatOrderStatus(order.status);
                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--text)]">
                          {order.order_number}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(order.created_at)} • {order.items?.length || 0} barang
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-bold text-gradient-gold">
                        {formatRupiah(order.total_amount)}
                      </span>
                      <Link href={`/orders`}>
                        <Button variant="secondary" size="sm">
                          Rincian
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Access: Downloads Banner ────────────────────────── */}
        <div className="mt-8 bg-gradient-to-r from-gold/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-gold/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Download className="w-5 h-5 text-gold" />
              <span>Akses File Produk Digital & Lisensi</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
              Unduh source code, ebook, template, dan lisensi resmi dari pesanan Anda yang telah berstatus lunas kapan saja.
            </p>
          </div>
          <Link href="/downloads">
            <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Buka Halaman Unduhan
            </Button>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
