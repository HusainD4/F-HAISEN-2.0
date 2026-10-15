'use client';
// ============================================================
// src/app/(admin)/admin/users/page.tsx
// Manajemen Pengguna & Multi-Role (Protected - Role: Superadmin)
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { fetchAllUsers, updateUser } from '@/services/user_api';
import { formatDate } from '@/utils/formatters';
import type { User } from '@/types/auth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers({
        page,
        per_page: 10,
        search: search.trim() || undefined,
      });
      if (res.items) {
        setUsers(res.items);
        setTotalPages(res.total_pages || 1);
      }
    } catch {
      toast.error('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleToggleStatus = async (user: User) => {
    setUpdatingId(user.id);
    const nextStatus = !user.is_active;
    try {
      await updateUser(user.id, { is_active: nextStatus });
      toast.success(`Status akun "${user.full_name}" berhasil diubah.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      );
    } catch {
      toast.error('Gagal memperbarui status akun.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['superadmin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Manajemen Akses
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            Daftar Pengguna & Otorisasi
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Kelola hak akses pengguna, verifikasi data pelanggan, dan status keaktifan akun.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <Input
            type="search"
            placeholder="Cari nama atau email pengguna..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Users Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                    <th className="pb-3 font-semibold">Pengguna</th>
                    <th className="pb-3 font-semibold">Email & Kontak</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Terdaftar</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-card)] transition-colors">
                      <td className="py-3 font-bold text-[var(--text)]">
                        {u.full_name}
                      </td>
                      <td className="py-3 text-[var(--text-muted)]">
                        <div>{u.email}</div>
                        {u.phone && <div className="text-[11px]">{u.phone}</div>}
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                          {u.role?.name || 'Customer'}
                        </span>
                      </td>
                      <td className="py-3 text-[var(--text-muted)]">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {u.is_active ? 'Aktif' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={updatingId === u.id}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.is_active ? 'Suspend' : 'Aktifkan'}
                        </Button>
                      </td>
                    </tr>
                  ))}
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
