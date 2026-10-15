'use client';
// ============================================================
// src/app/(admin)/admin/page.tsx — Admin Dashboard Overview
// ============================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, DollarSign, Users, Package, ShoppingBag, ArrowRight,
  BarChart3, Activity, Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowUpRight, ArrowDownRight, Layers,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role_guard';
import { Button } from '@/components/ui/button';
import { fetchAllOrders } from '@/services/order_api';
import { fetchProducts } from '@/services/product_api';
import { fetchAllUsers } from '@/services/user_api';
import { formatRupiah, formatDate, formatRelativeTime, formatOrderStatus } from '@/utils/formatters';
import type { Order } from '@/types/order';

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const meta = formatOrderStatus(status);
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    blue:   'bg-blue-500/10 text-blue-500 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    green:  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    red:    'bg-red-500/10 text-red-500 border-red-500/20',
    gray:   'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)]',
    teal:   'bg-teal-500/10 text-teal-500 border-teal-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${colorMap[meta.color] ?? colorMap.gray}`}>
      {meta.label}
    </span>
  );
}

// ── Metric Card ───────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  trend?: 'up' | 'down' | null;
  trendLabel?: string;
}
function MetricCard({ label, value, icon, iconBg, sub, trend, trendLabel }: MetricCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 hover:border-gold/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendLabel}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers]   = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          fetchAllOrders({ page: 1, per_page: 8 }),
          fetchProducts({ per_page: 1 }),
          fetchAllUsers({ per_page: 1 }),
        ]);
        if (!isMounted) return;
        if (ordersRes.status === 'fulfilled') {
          const r = ordersRes.value;
          setOrders(r.items ?? []);
          setTotalOrders((r as any).total ?? (r.items?.length ?? 0));
        }
        if (productsRes.status === 'fulfilled') {
          setTotalProducts((productsRes.value as any).total ?? 0);
        }
        if (usersRes.status === 'fulfilled') {
          setTotalUsers((usersRes.value as any).total ?? 0);
        }
      } catch { /* silent */ } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMetrics();
    return () => { isMounted = false; };
  }, []);

  const paidOrders     = orders.filter((o) => o.status === 'paid' || o.status === 'completed');
  const pendingOrders  = orders.filter((o) => o.status === 'pending');
  const totalRevenue   = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);

  return (
    <RoleGuard allowedRoles={['superadmin', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full mb-2">
              <Activity className="w-3 h-3" /> Panel Kendali Sistem
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Admin Overview</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Ringkasan real-time performa penjualan, inventaris, dan aktivitas pesanan.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin/products">
              <Button variant="secondary" size="sm" leftIcon={<Package className="w-4 h-4" />}>Kelola Produk</Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="gold" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>Kelola Pesanan</Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>Kelola User</Button>
            </Link>
          </div>
        </div>

        {/* ── Metric Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <MetricCard
            label="Total Omset (Lunas)"
            value={formatRupiah(totalRevenue)}
            icon={<DollarSign className="w-5 h-5 text-gold" />}
            iconBg="bg-gold/10"
            sub={`Dari ${paidOrders.length} transaksi lunas`}
          />
          <MetricCard
            label="Total Pesanan"
            value={totalOrders}
            icon={<ShoppingBag className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/10"
            sub={`${pendingOrders.length} menunggu pembayaran`}
          />
          <MetricCard
            label="Katalog Produk"
            value={totalProducts}
            icon={<Package className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10"
          />
          <MetricCard
            label="Pengguna Terdaftar"
            value={totalUsers}
            icon={<Users className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
          />
        </div>

        {/* ── Status Summary Row ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Menunggu', count: orders.filter(o=>o.status==='pending').length, icon: <Clock className="w-4 h-4"/>, color: 'text-yellow-500 bg-yellow-500/10' },
            { label: 'Diproses', count: orders.filter(o=>o.status==='processing').length, icon: <BarChart3 className="w-4 h-4"/>, color: 'text-blue-400 bg-blue-500/10' },
            { label: 'Selesai',  count: orders.filter(o=>o.status==='completed').length, icon: <CheckCircle2 className="w-4 h-4"/>, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Dibatalkan', count: orders.filter(o=>o.status==='cancelled').length, icon: <XCircle className="w-4 h-4"/>, color: 'text-red-400 bg-red-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--text)]">{s.count}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Orders Table ───────────────────────────────── */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold" />
              <h2 className="text-base font-bold text-[var(--text)]">Pesanan Masuk Terbaru</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-gold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-14 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[var(--text-muted)] mt-3">Memuat data pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-14 text-center">
              <Layers className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Belum ada pesanan yang masuk.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[var(--bg-card)]">
                  <tr className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wide">
                    <th className="px-6 py-3">No. Order</th>
                    <th className="px-3 py-3">Pelanggan</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Waktu</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[var(--bg-card)] transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-[var(--text)]">
                        {o.order_number}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-medium text-[var(--text)] truncate max-w-[120px]">{o.customer_name ?? '—'}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">{o.customer_email ?? ''}</p>
                      </td>
                      <td className="px-3 py-4 font-bold text-gradient-gold">
                        {formatRupiah(o.total_amount)}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-3 py-4 text-[var(--text-muted)] text-xs">
                        {formatRelativeTime(o.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/admin/orders">
                          <Button variant="ghost" size="sm">Detail</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick Links ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { href: '/admin/products', icon: <Package className="w-5 h-5 text-purple-400" />, bg: 'bg-purple-500/10', title: 'Manajemen Produk', desc: 'Tambah, edit, hapus produk & kategori' },
            { href: '/admin/orders',   icon: <ShoppingBag className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10',   title: 'Manajemen Pesanan', desc: 'Update status & pantau transaksi' },
            { href: '/admin/users',    icon: <Users className="w-5 h-5 text-emerald-400" />,  bg: 'bg-emerald-500/10', title: 'Manajemen Pengguna', desc: 'Kelola akun & role pengguna' },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-gold/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-gold/10 hover:shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${q.bg} shrink-0`}>
                {q.icon}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text)] group-hover:text-gold transition-colors">{q.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{q.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-gold ml-auto transition-colors shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </RoleGuard>
  );
}
