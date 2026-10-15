// ============================================================
// src/utils/formatters.ts
// Format Rupiah, Tanggal Indonesia & Status Label (Diperkuat)
// ============================================================

/** 
 * Format angka/string angka ke format Rupiah Indonesia yang aman dari NaN.
 * Mendukung input number, string, null, atau undefined.
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  // Konversi aman ke number, fallback ke 0 jika invalid
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount ?? '0');
  const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/** Format ISO date string ke format tanggal Indonesia */
export function formatDate(isoString: string | null | undefined, includeTime = false): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
    timeZone: 'Asia/Jakarta',
  };
  return date.toLocaleDateString('id-ID', options);
}

/** Format relatif waktu (misal: "2 jam lalu") */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDate(isoString);
}

/** Label & warna status pesanan (Lengkap dengan badge styling Tailwind) */
export function formatOrderStatus(status: string | null | undefined): { label: string; color: string; badgeClass: string } {
  const normalizedStatus = (status ?? '').toLowerCase();
  
  const map: Record<string, { label: string; color: string; badgeClass: string }> = {
    pending:      { label: 'Menunggu Pembayaran', color: 'yellow', badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    paid:         { label: 'Sudah Dibayar',       color: 'blue',   badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    processing:   { label: 'Diproses',            color: 'indigo', badgeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    shipped:      { label: 'Dikirim',             color: 'purple', badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    delivered:    { label: 'Terkirim',            color: 'teal',   badgeClass: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    completed:    { label: 'Selesai',             color: 'green',  badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    cancelled:    { label: 'Dibatalkan',          color: 'red',    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    refunded:     { label: 'Dikembalikan',        color: 'gray',   badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  };

  return map[normalizedStatus] ?? { 
    label: status ?? 'Unknown', 
    color: 'gray', 
    badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
  };
}

/** Label & warna status pembayaran Midtrans */
export function formatPaymentStatus(status: string | null | undefined): { label: string; color: string; badgeClass: string } {
  const normalizedStatus = (status ?? '').toLowerCase();

  const map: Record<string, { label: string; color: string; badgeClass: string }> = {
    pending:        { label: 'Menunggu',        color: 'yellow', badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    settlement:     { label: 'Lunas',           color: 'green',  badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    capture:        { label: 'Tertangkap',      color: 'green',  badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    deny:           { label: 'Ditolak',         color: 'red',    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    cancel:         { label: 'Dibatalkan',      color: 'red',    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    expire:         { label: 'Kedaluwarsa',     color: 'orange', badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    refund:         { label: 'Refund',          color: 'gray',   badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    partial_refund: { label: 'Refund Sebagian', color: 'gray',   badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  };

  return map[normalizedStatus] ?? { 
    label: status ?? 'Unknown', 
    color: 'gray', 
    badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
  };
}

/** Format jenis produk */
export function formatProductType(type: string | null | undefined): string {
  const map: Record<string, string> = {
    physical: 'Barang Fisik',
    digital:  'Produk Digital',
    service:  'Jasa',
  };
  return map[type ?? ''] ?? (type ?? '-');
}

/** Format ukuran file (bytes → KB/MB) */
export function formatFileSize(bytes: number | null | undefined): string {
  const safeBytes = Number(bytes) || 0;
  if (safeBytes < 1024) return `${safeBytes} B`;
  if (safeBytes < 1_048_576) return `${(safeBytes / 1024).toFixed(1)} KB`;
  return `${(safeBytes / 1_048_576).toFixed(1)} MB`;
}

/** Singkat nomor besar (1000 → 1rb, 1000000 → 1jt) */
export function formatCompactNumber(n: number | null | undefined): string {
  const safeN = Number(n) || 0;
  if (safeN >= 1_000_000) return `${(safeN / 1_000_000).toFixed(1)}jt`;
  if (safeN >= 1_000) return `${(safeN / 1_000).toFixed(0)}rb`;
  return String(safeN);
}

/** 
 * TAMBAHAN BARU: Format nomor telepon Indonesia ke standar internasional/lokal 
 * Contoh: "08123456789" atau "+628123456789"
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  }
  // Format rapi spasi (misal: 0812 3456 7890)
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
} 