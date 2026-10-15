'use client';
// ============================================================
// src/app/(admin)/admin/orders/page.tsx
// Manajemen Transaksi & Pesanan Admin — Update Status & Ekspedisi
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role_guard';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { fetchAllOrders, updateOrderStatus } from '@/services/order_api';
import { formatRupiah, formatDate, formatOrderStatus } from '@/utils/formatters';
import type { Order, OrderStatus } from '@/types/order';

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Lunas (Tervalidasi)' },
  { value: 'processing', label: 'Sedang Diproses' },
  { value: 'shipped', label: 'Dikirim (Fisik)' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders({
        page,
        per_page: 10,
        status: statusFilter || undefined,
      });
      if (res.items) {
        setOrders(res.items);
        setTotalPages(res.total_pages || 1);
      }
    } catch {
      toast.error('Gagal memuat daftar pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      toast.success('Status pesanan berhasil diperbarui!');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as OrderStatus } : o))
      );
    } catch {
      toast.error('Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['superadmin', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Manajemen Penjualan
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
              Daftar Pesanan Toko
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[var(--bg-surface)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            >
              <option value="">Semua Status</option>
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              Tidak ada pesanan ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                    <th className="pb-3 font-semibold">No. Order</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">Item & Info Pengiriman</th>
                    <th className="pb-3 font-semibold">Total Tagihan</th>
                    <th className="pb-3 font-semibold">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orders.map((o) => {
                    const statusMeta = formatOrderStatus(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-[var(--bg-card)] transition-colors">
                        <td className="py-3 font-bold text-[var(--text)] align-top">
                          {o.order_number}
                        </td>
                        <td className="py-3 text-[var(--text-muted)] align-top">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="py-3 max-w-sm align-top">
                          <div className="space-y-1">
                            {o.items?.map((item) => (
                              <div key={item.id} className="text-xs">
                                • {item.product_name} ({item.quantity}x)
                              </div>
                            ))}
                            {o.shipping_address && (
                              <div className="text-[11px] text-amber-500 pt-1">
                                🚚 {o.courier} ({o.courier_service}): {o.shipping_city},{' '}
                                {o.shipping_province}
                              </div>
                            )}
                            {o.order_note && (
                              <div className="text-[11px] text-[var(--text-muted)] italic">
                                Note: {o.order_note}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-bold text-gradient-gold align-top">
                          {formatRupiah(o.total_amount)}
                        </td>
                        <td className="py-3 align-top">
                          <select
                            disabled={updatingId === o.id}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-gold"
                          >
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
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
    </RoleGuard>
  );
}
