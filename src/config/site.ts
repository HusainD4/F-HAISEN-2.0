// ============================================================
// src/config/site.ts
// Metadata Toko, SEO & Canonical URLs
// ============================================================

export const SITE = {
  name: 'Haisen Official Store',
  tagline: 'Produk Digital & Jasa Terpercaya',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://store.haisen.my.id',
  description:
    'Haisen Official Store — Temukan produk digital, jasa, dan barang berkualitas dari Haisen Official.',
  locale: 'id_ID',
  currency: 'IDR',
  currencySymbol: 'Rp',
  email: 'support@haisen.my.id',
  whatsapp: '6281234567890', // ganti dengan nomor real
  socials: {
    instagram: 'https://instagram.com/haisenofficial',
    tiktok: 'https://tiktok.com/@haisenofficial',
  },
  og: {
    image: '/og-image.png',
    twitterCard: 'summary_large_image' as const,
  },
} as const;
