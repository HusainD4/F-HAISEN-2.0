'use client';
// ============================================================
// src/app/(dashboard)/orders/page.tsx
// Riwayat Pesanan Pengguna — Status Transaksi & Pelunasan Midtrans Snap
// ============================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { AuthGuard } from '@/components/guards/auth_guard';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { fetchMyOrders } from '@/services/order_api';
import { getSnapToken } from '@/services/payment_api';
import { formatRupiah, formatDate, formatOrderStatus, formatProductType } from '@/utils/formatters';
import type { Order, OrderStatus } from '@/types/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchMyOrders(page, 10);
      if (res.items) {
        setOrders(res.items);
        setTotalPages(res.total_pages || 1);
      }
    } catch {
      toast.error('Gagal memuat riwayat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const { snap_token } = await getSnapToken(orderId);
      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(snap_token, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil diverifikasi!');
            loadOrders();
          },
          onPending: () => {
            toast.info('Menunggu penyelesaian pembayaran.');
            loadOrders();
          },
          onError: () => {
            toast.error('Pembayaran gagal diproses.');
          },
          onClose: () => {
            toast.info('Popup pembayaran ditutup.');
          },
        });
      } else {
        toast.info('Midtrans SDK belum siap. Silakan muat ulang halaman.');
      }
    } catch {
      toast.error('Gagal mendapatkan token pembayaran.');
    } finally {
      setPayingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return o.status === 'pending';
    if (filterStatus === 'paid') return o.status === 'paid' || o.status === 'completed';
    if (filterStatus === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Riwayat Transaksi
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Pantau status verifikasi pembayaran, pengiriman paket fisik, dan akses instan produk.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-4">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: 'Menunggu Pembayaran' },
            { id: 'paid', label: 'Lunas / Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-gold text-charcoal-900 shadow-gold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)]">
            <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[var(--text)]">Tidak ada pesanan pada status ini</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Semua transaksi Anda akan tercatat rapi di sini.
            </p>
            <Link href="/products" className="inline-block mt-6">
              <Button variant="gold" size="sm">
                Belanja Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusMeta = formatOrderStatus(order.status);
              const isPending = order.status === 'pending';

              return (
                <div
                  key={order.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 transition-all hover:border-gold/40 shadow-sm"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-base text-[var(--text)]">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="py-4 space-y-3">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text)]">{item.product_name}</span>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                              {formatProductType(item.product_type)}
                            </span>
                          </div>
                          <span className="text-[var(--text-muted)] text-xs">
                            {item.quantity} barang × {formatRupiah(item.unit_price)}
                          </span>
                        </div>
                        <span className="font-bold text-[var(--text)]">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info if Physical */}
                  {order.shipping_address && (
                    <div className="py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-2 mb-4">
                      <Truck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--text)]">Pengiriman Fisik:</strong>{' '}
                        {order.courier} ({order.courier_service}) — {order.shipping_address},{' '}
                        {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                      </div>
                    </div>
                  )}

                  {/* Order Bottom Action Bar */}
                  <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-[var(--text-muted)] block">Total Tagihan</span>
                      <span className="text-xl font-bold text-gradient-gold">
                        {formatRupiah(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {isPending && (
                        <Button
                          variant="gold"
                          size="sm"
                          loading={payingOrderId === order.id}
                          onClick={() => handlePayNow(order.id)}
                          rightIcon={<CreditCard className="w-4 h-4" />}
                        >
                          Bayar Sekarang
                        </Button>
                      )}

                      {(order.status === 'paid' || order.status === 'completed') && (
                        <Link href="/downloads">
                          <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            Akses Unduhan
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
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
    </AuthGuard>
  );
}
