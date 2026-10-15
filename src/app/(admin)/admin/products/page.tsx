'use client';
// ============================================================
// src/app/(admin)/admin/products/page.tsx — Manajemen Produk
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, Plus, Trash2, Edit2, Search, Tag, RefreshCw,
  ChevronLeft, ChevronRight, X, Check, ExternalLink, Layers,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, createCategory, deleteCategory,
  type ProductCreatePayload,
} from '@/services/product_api';
import { formatRupiah, formatProductType, formatDate } from '@/utils/formatters';
import type { Product, ProductCategory, ProductType } from '@/types/product';
import { useDebounce } from '@/hooks/use_debounce';

type Tab = 'products' | 'categories';

// ── Helpers ───────────────────────────────────────────────────
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Product Form Modal ────────────────────────────────────────
interface ProductFormProps {
  open: boolean;
  editing: Product | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM: ProductCreatePayload = {
  name: '', slug: '', description: '', short_description: '',
  base_price: 0, product_type: 'digital',
  is_active: true, is_featured: false,
};

function ProductFormModal({ open, editing, categories, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState<ProductCreatePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name:              editing.name,
        slug:              editing.slug,
        description:       editing.description,
        short_description: '',
        base_price:        editing.price,
        product_type:      editing.product_type,
        category_id:       editing.category?.id ?? '',
        is_active:         editing.is_active,
        is_featured:       false,
        thumbnail_url:     editing.thumbnail_url ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const set = (key: keyof ProductCreatePayload, val: unknown) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    set('name', name);
    if (!editing) set('slug', slugify(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.description.trim()) {
      toast.error('Nama, slug, dan deskripsi wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const payload: ProductCreatePayload = {
        ...form,
        category_id: form.category_id || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        short_description: form.short_description || undefined,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success(`Produk "${form.name}" berhasil diperbarui.`);
      } else {
        await createProduct(payload);
        toast.success(`Produk "${form.name}" berhasil ditambahkan!`);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Produk' : 'Tambah Produk Baru'}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">

        <Input label="Nama Produk *" placeholder="Contoh: Template SaaS FastAPI"
          value={form.name} onChange={handleNameChange} />

        <Input label="Slug URL *" placeholder="template-saas-fastapi"
          value={form.slug}
          onChange={(e) => set('slug', e.target.value)}
          hint="Digunakan sebagai URL produk, huruf kecil & tanda hubung" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Harga Dasar (IDR) *" type="number" placeholder="250000"
            value={form.base_price}
            onChange={(e) => set('base_price', Number(e.target.value))} />

          <div>
            <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Jenis Produk *</label>
            <select value={form.product_type}
              onChange={(e) => set('product_type', e.target.value as ProductType)}
              className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold">
              <option value="digital">Produk Digital</option>
              <option value="service">Jasa / Layanan</option>
              <option value="physical">Barang Fisik</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Kategori</label>
            <select value={form.category_id ?? ''}
              onChange={(e) => set('category_id', e.target.value)}
              className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold">
              <option value="">— Tanpa Kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Harga Diskon (opsional)" type="number" placeholder="200000"
            value={form.discount_price ?? ''}
            onChange={(e) => set('discount_price', e.target.value ? Number(e.target.value) : undefined)} />
        </div>

        <Input label="URL Thumbnail (opsional)" placeholder="https://cdn.example.com/img.jpg"
          value={form.thumbnail_url ?? ''}
          onChange={(e) => set('thumbnail_url', e.target.value)} />

        <div>
          <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Deskripsi Singkat</label>
          <input type="text" placeholder="Ringkasan singkat produk (maks 300 karakter)"
            value={form.short_description ?? ''}
            onChange={(e) => set('short_description', e.target.value)}
            maxLength={300}
            className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold" />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Deskripsi Lengkap *</label>
          <textarea rows={5} placeholder="Tuliskan spesifikasi, fitur unggulan, lisensi, dan keunggulan produk secara detail..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold resize-none" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-gold" />
            <span className="text-sm text-[var(--text)]">Produk Aktif (tampil di toko)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={(e) => set('is_featured', e.target.checked)}
              className="w-4 h-4 accent-gold" />
            <span className="text-sm text-[var(--text)]">Produk Unggulan (featured)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button variant="gold" type="submit" loading={saving}>
            {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [tab, setTab]                 = useState<Tab>('products');
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<ProductCategory[]>([]);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const debouncedSearch               = useDebounce(search, 400);

  // Modal
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingProduct, setEditing]  = useState<Product | null>(null);

  // Category form
  const [catName, setCatName]         = useState('');
  const [catSlug, setCatSlug]         = useState('');
  const [savingCat, setSavingCat]     = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({ page, per_page: 10, search: debouncedSearch || undefined });
      const r = res as any;
      setProducts(r.items ?? r.data?.items ?? []);
      setTotalPages(r.total_pages ?? r.meta?.total_pages ?? 1);
    } catch {
      toast.error('Gagal memuat katalog produk.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (p: Product) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteProduct(p.id);
      toast.success(`"${p.name}" berhasil dihapus.`);
      loadProducts();
    } catch { toast.error('Gagal menghapus produk.'); }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      toast.error('Nama dan slug kategori wajib diisi.'); return;
    }
    setSavingCat(true);
    try {
      await createCategory({ name: catName.trim(), slug: catSlug.trim(), is_active: true });
      toast.success('Kategori berhasil ditambahkan!');
      setCatName(''); setCatSlug('');
      loadCategories();
    } catch { toast.error('Gagal menambah kategori.'); } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: ProductCategory) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Kategori dihapus.');
      loadCategories();
    } catch { toast.error('Gagal menghapus kategori.'); }
  };

  return (
    <RoleGuard allowedRoles={['superadmin', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold block mb-1">Manajemen Inventaris</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Katalog Produk</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Tambah, edit, dan kelola produk serta kategori toko.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { loadProducts(); loadCategories(); }}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-gold hover:bg-[var(--bg-surface)] transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button variant="gold" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* ── Tab Bar ────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
          {([['products', 'Produk', <Package className="w-4 h-4" />], ['categories', 'Kategori', <Tag className="w-4 h-4" />]] as const).map(([t, label, icon]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-gold text-gold' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}>
              {icon}{label}
              {t === 'products' && <span className="ml-1 bg-gold/15 text-gold text-[10px] px-1.5 py-0.5 rounded-full font-bold">{products.length}</span>}
              {t === 'categories' && <span className="ml-1 bg-[var(--bg-surface)] text-[var(--text-muted)] text-[10px] px-1.5 py-0.5 rounded-full font-bold">{categories.length}</span>}
            </button>
          ))}
        </div>

        {/* ── Products Tab ───────────────────────────────────── */}
        {tab === 'products' && (
          <>
            <div className="mb-5 max-w-sm">
              <Input type="search" placeholder="Cari nama produk..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                leftIcon={<Search className="w-4 h-4" />} />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-[var(--text-muted)] mt-3">Memuat produk...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center">
                  <Layers className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[var(--text)]">Tidak ada produk ditemukan</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Coba ubah kata kunci atau tambah produk baru.</p>
                  <div className="mt-4">
                    <Button variant="gold" size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
                      Tambah Produk Pertama
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[var(--bg-card)]">
                      <tr className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wide">
                        <th className="px-6 py-3">Nama Produk</th>
                        <th className="px-3 py-3">Tipe</th>
                        <th className="px-3 py-3">Harga</th>
                        <th className="px-3 py-3">Kategori</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Dibuat</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[var(--bg-card)] transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[var(--text)] truncate max-w-[220px]">{p.name}</p>
                            <p className="text-[11px] text-[var(--text-muted)] font-mono">{p.slug}</p>
                          </td>
                          <td className="px-3 py-4">
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                              {formatProductType(p.product_type)}
                            </span>
                          </td>
                          <td className="px-3 py-4 font-bold text-gradient-gold">
                            {formatRupiah(p.price)}
                          </td>
                          <td className="px-3 py-4 text-[var(--text-muted)] text-xs">
                            {p.category?.name ?? '—'}
                          </td>
                          <td className="px-3 py-4">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                              p.is_active
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {p.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-[var(--text-muted)] text-xs">
                            {formatDate(p.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 justify-end">
                              <a href={`/products/${p.slug}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 text-[var(--text-muted)] hover:text-gold transition-colors" title="Lihat di toko">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button onClick={() => openEdit(p)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(p)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="secondary" size="sm" disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  Sebelumnya
                </Button>
                <span className="text-sm text-[var(--text-muted)]">Hal {page} / {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}

        {/* ── Categories Tab ─────────────────────────────────── */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Add Category Form */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="text-base font-bold text-[var(--text)] mb-4">Tambah Kategori</h3>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <Input label="Nama Kategori *" placeholder="Contoh: Source Code"
                  value={catName}
                  onChange={(e) => { setCatName(e.target.value); setCatSlug(slugify(e.target.value)); }} />
                <Input label="Slug *" placeholder="source-code"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  hint="Huruf kecil, tanda hubung, tanpa spasi" />
                <Button variant="gold" type="submit" loading={savingCat} fullWidth leftIcon={<Plus className="w-4 h-4" />}>
                  Tambah Kategori
                </Button>
              </form>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text)]">Daftar Kategori ({categories.length})</h3>
              </div>
              {categories.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-muted)] text-sm">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Belum ada kategori. Tambahkan dari form di sebelah kiri.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-card)] transition-colors group">
                      <div>
                        <p className="font-semibold text-sm text-[var(--text)]">{cat.name}</p>
                        <p className="text-xs font-mono text-[var(--text-muted)]">{cat.slug}</p>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        editing={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
      />
    </RoleGuard>
  );
}
