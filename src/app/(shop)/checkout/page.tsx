'use client';
// ============================================================
// src/app/(shop)/checkout/page.tsx
// Halaman Checkout — Kondisional: Produk Fisik vs Digital/Jasa + Midtrans Snap
// ============================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Package,
  Sparkles,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AuthGuard } from '@/components/guards/auth_guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use_auth';
import { useCart } from '@/hooks/use_cart';
import { checkoutPhysicalSchema, checkoutDigitalSchema } from '@/utils/validators';
import { checkout } from '@/services/order_api';
import { getSnapToken } from '@/services/payment_api';
import { formatRupiah, formatProductType } from '@/utils/formatters';
import { parseApiError } from '@/services/error_handler';
import { env } from '@/config/env';

// Opsi Layanan Ekspedisi Pengiriman
const COURIER_OPTIONS = [
  { id: 'jne', name: 'JNE Express', services: [{ name: 'REG (Reguler 2-3 hari)', cost: 22000 }, { name: 'YES (Yakin Esok Sampai)', cost: 38000 }] },
  { id: 'jnt', name: 'J&T Express', services: [{ name: 'EZ (Reguler 2-3 hari)', cost: 20000 }] },
  { id: 'sicepat', name: 'SiCepat', services: [{ name: 'SIUNTUNG (Reguler)', cost: 21000 }, { name: 'BEST (1 hari)', cost: 35000 }] },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalItems, subtotal, hasPhysicalItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [form, setForm] = useState({
    address: user?.address || '',
    province: user?.province || '',
    city: user?.city || '',
    district: user?.district || '',
    postal_code: user?.postal_code || '',
    courier: '',
    courier_service: '',
    order_note: '',
  });

  const [shippingCost, setShippingCost] = useState(0);

  // Sync user profile data if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        address: prev.address || user.address || '',
        province: prev.province || user.province || '',
        city: prev.city || user.city || '',
        district: prev.district || user.district || '',
        postal_code: prev.postal_code || user.postal_code || '',
      }));
    }
  }, [user]);

  // Set default courier automatically if physical items exist and courier is not set
  useEffect(() => {
    if (hasPhysicalItems && !form.courier && COURIER_OPTIONS.length > 0) {
      const defaultCourier = COURIER_OPTIONS[0];
      const defaultService = defaultCourier.services[0];
      setForm((prev) => ({
        ...prev,
        courier: defaultCourier.name,
        courier_service: defaultService.name,
      }));
      setShippingCost(defaultService.cost);
    }
  }, [hasPhysicalItems, form.courier]);

  // Load Midtrans Snap Script
  useEffect(() => {
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Update shipping cost when courier service changes
  const handleCourierChange = (courierName: string) => {
    const selected = COURIER_OPTIONS.find((c) => c.name === courierName);
    const defaultService = selected?.services[0];
    setForm((prev) => ({
      ...prev,
      courier: courierName,
      courier_service: defaultService ? defaultService.name : '',
    }));
    setShippingCost(defaultService ? Number(defaultService.cost) || 0 : 0);
  };

  const handleServiceChange = (serviceName: string) => {
    const selectedCourier = COURIER_OPTIONS.find((c) => c.name === form.courier);
    const selectedService = selectedCourier?.services.find((s) => s.name === serviceName);
    setForm((prev) => ({ ...prev, courier_service: serviceName }));
    setShippingCost(selectedService ? Number(selectedService.cost) || 0 : 0);
  };

  // Safe number calculations to prevent NaN
  const safeSubtotal = Number(subtotal) || 0;
  const safeShippingCost = Number(shippingCost) || 0;
  const totalAmount = safeSubtotal + (hasPhysicalItems ? safeShippingCost : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (items.length === 0) {
      toast.error('Keranjang belanja Anda kosong.');
      router.push('/products');
      return;
    }

    // Validasi kondisional
    if (hasPhysicalItems) {
      const result = checkoutPhysicalSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Mohon lengkapi seluruh informasi pengiriman barang fisik.');
        return;
      }
    } else {
      const result = checkoutDigitalSchema.safeParse({ order_note: form.order_note });
      if (!result.success) {
        setErrors({ order_note: result.error.errors[0]?.message || '' });
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Buat pesanan di backend
      const orderPayload = {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: hasPhysicalItems ? form.address : undefined,
        shipping_province: hasPhysicalItems ? form.province : undefined,
        shipping_city: hasPhysicalItems ? form.city : undefined,
        shipping_district: hasPhysicalItems ? form.district : undefined,
        shipping_postal_code: hasPhysicalItems ? form.postal_code : undefined,
        courier: hasPhysicalItems ? form.courier : undefined,
        courier_service: hasPhysicalItems ? form.courier_service : undefined,
        shipping_cost: hasPhysicalItems ? safeShippingCost : 0,
        order_note: form.order_note || undefined,
      };

      const order = await checkout(orderPayload);
      clearCart();

      // 2. Minta Snap Token
      try {
        const { snap_token } = await getSnapToken(order.id);

        // 3. Trigger Midtrans Snap popup
        if (typeof window !== 'undefined' && (window as any).snap) {
          (window as any).snap.pay(snap_token, {
            onSuccess: () => {
              toast.success('Pembayaran berhasil diverifikasi!');
              router.push('/orders');
            },
            onPending: () => {
              toast.info('Menunggu penyelesaian pembayaran.');
              router.push('/orders');
            },
            onError: () => {
              toast.error('Pembayaran gagal diproses.');
              router.push('/orders');
            },
            onClose: () => {
              toast.info('Popup pembayaran ditutup. Anda dapat melanjutkan dari Riwayat Pesanan.');
              router.push('/orders');
            },
          });
        } else {
          toast.success('Pesanan berhasil dibuat!');
          router.push('/orders');
        }
      } catch {
        toast.success('Pesanan dibuat. Silakan selesaikan pembayaran di menu Pesanan.');
        router.push('/orders');
      }
    } catch (err: unknown) {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Keranjang Belanja Kosong</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Tambahkan produk terlebih dahulu sebelum melakukan checkout.
        </p>
        <Link href="/products" className="inline-block mt-6">
          <Button variant="gold">Jelajahi Produk</Button>
        </Link>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            Proses Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            Konfirmasi Pesanan & Pembayaran
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ── Left Column: Form Pengiriman / Data Pembeli ──────────── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Box Info Akun Pembeli */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
                <h3 className="text-base font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-gold" />
                  <span>Informasi Pembeli Terverifikasi</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-[var(--text-muted)] block">Nama Penerima / Akun</span>
                    <strong className="text-[var(--text)]">{user?.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Email Akun</span>
                    <strong className="text-[var(--text)]">{user?.email}</strong>
                  </div>
                  {user?.phone && (
                    <div>
                      <span className="text-[var(--text-muted)] block">Nomor HP / WhatsApp</span>
                      <strong className="text-[var(--text)]">{user.phone}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Box Kondisional: Alamat Pengiriman Fisik vs Digital */}
              {hasPhysicalItems ? (
                <div className="bg-[var(--bg-surface)] border border-amber-500/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)]">
                    <Truck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)]">
                        Alamat Pengiriman Barang Fisik
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Karena pesanan Anda mengandung barang fisik, data alamat lengkap wajib diisi untuk ekspedisi.
                      </p>
                    </div>
                  </div>

                  <Input
                    label="Alamat Lengkap"
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                    required
                    value={form.address}
                    error={errors.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Provinsi"
                      placeholder="Contoh: Jawa Barat"
                      required
                      value={form.province}
                      error={errors.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                    />
                    <Input
                      label="Kabupaten / Kota"
                      placeholder="Contoh: Bandung"
                      required
                      value={form.city}
                      error={errors.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Kecamatan"
                      placeholder="Contoh: Coblong"
                      required
                      value={form.district}
                      error={errors.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                    <Input
                      label="Kode Pos"
                      placeholder="5 digit (contoh: 40132)"
                      required
                      value={form.postal_code}
                      error={errors.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    />
                  </div>

                  {/* Pilihan Kurir */}
                  <div className="pt-2 space-y-3">
                    <label className="text-sm font-medium text-[var(--text)] block">
                      Pilihan Ekspedisi & Layanan <span className="text-gold">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {COURIER_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCourierChange(c.name)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            form.courier === c.name
                              ? 'border-gold bg-gold/10 font-bold text-gold'
                              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-gold/50'
                          }`}
                        >
                          <span className="text-xs font-semibold block">{c.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.courier && <p className="text-xs text-red-500">{errors.courier}</p>}

                    {/* Layanan Ekspedisi */}
                    {form.courier && (
                      <div className="pt-2">
                        <select
                          value={form.courier_service}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                        >
                          {COURIER_OPTIONS.find((c) => c.name === form.courier)?.services.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name} — {formatRupiah(s.cost)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--bg-surface)] border border-emerald-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)]">
                        Pesanan Produk Digital / Jasa
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                        Pesanan Anda berupa produk non-fisik. Tidak diperlukan alamat pengiriman ekspedisi. Tautan unduhan produk atau konfirmasi jasa akan langsung aktif di akun pembeli setelah pembayaran lunas diverifikasi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Pembeli */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
                <label className="text-sm font-medium text-[var(--text)] block mb-2">
                  Catatan Tambahan untuk Penjual (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={form.order_note}
                  onChange={(e) => setForm({ ...form, order_note: e.target.value })}
                  placeholder="Contoh: instruksi kustomisasi jasa, catatan warna produk fisik, dll."
                  className="w-full bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold resize-none"
                />
              </div>
            </div>

            {/* ── Right Column: Ringkasan Pesanan & Pembayaran ─────────── */}
            <div className="lg:col-span-5">
              <div className="bg-[var(--bg-surface)] border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-gold/20 flex flex-col gap-6 sticky top-28">
                <h3 className="text-lg font-bold text-[var(--text)] pb-3 border-b border-[var(--border)]">
                  Ringkasan Pesanan ({totalItems} item)
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 0;
                    return (
                      <div key={item.product_id} className="flex justify-between text-xs sm:text-sm gap-2">
                        <div className="truncate flex-1">
                          <span className="font-semibold text-[var(--text)] block truncate">
                            {item.name}
                          </span>
                          <span className="text-[var(--text-muted)] text-[11px]">
                            {itemQty}x @ {formatRupiah(itemPrice)}
                          </span>
                        </div>
                        <span className="font-semibold text-[var(--text)] shrink-0">
                          {formatRupiah(itemPrice * itemQty)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Breakdown Costs */}
                <div className="pt-4 border-t border-[var(--border)] space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Subtotal Barang</span>
                    <span className="font-semibold text-[var(--text)]">{formatRupiah(safeSubtotal)}</span>
                  </div>
                  {hasPhysicalItems && (
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Ongkos Kirim ({form.courier || '-'})</span>
                      <span className="font-semibold text-[var(--text)]">
                        {safeShippingCost > 0 ? formatRupiah(safeShippingCost) : 'Pilih kurir'}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between text-base font-bold text-[var(--text)]">
                    <span>Total Pembayaran</span>
                    <span className="text-2xl text-gradient-gold">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  fullWidth
                  loading={loading}
                  rightIcon={<CreditCard className="w-4 h-4" />}
                >
                  Bayar Sekarang via Midtrans
                </Button>

                {/* Security Badge */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                  <Lock className="w-3.5 h-3.5 text-gold" />
                  <span>Transaksi Aman & Terenkripsi 256-bit</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}