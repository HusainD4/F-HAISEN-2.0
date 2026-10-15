'use client';
// ============================================================
// src/components/common/footer.tsx
// Footer premium dengan gradient gold accent, links, sosmed
// ============================================================

import Link from 'next/link';
import { Instagram, ExternalLink, Heart } from 'lucide-react';
import { SITE } from '@/config/site';

const LINKS = {
  Toko: [
    { label: 'Semua Produk', href: '/products' },
    { label: 'Produk Digital', href: '/products?type=digital' },
    { label: 'Jasa', href: '/products?type=service' },
    { label: 'Barang Fisik', href: '/products?type=physical' },
  ],
  Akun: [
    { label: 'Login', href: '/login' },
    { label: 'Daftar', href: '/register' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pesanan Saya', href: '/orders' },
  ],
  Bantuan: [
    { label: 'Cara Pembelian', href: '/#cara-beli' },
    { label: 'Kebijakan Pengembalian', href: '/#refund' },
    { label: 'Hubungi Kami', href: '/#contact' },
    { label: 'FAQ', href: '/#faq' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] mt-20">
      {/* Gold accent bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
                <span className="text-charcoal-900 font-black text-base">H</span>
              </div>
              <div>
                <p className="text-sm font-black tracking-widest text-gold uppercase">HAISEN OFFICIAL</p>
                <p className="text-[10px] text-[var(--text-muted)] tracking-wider">Solusi Digital Terintegrasi</p>
              </div>
            </Link>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Platform toko digital terpercaya untuk produk digital, jasa, dan barang fisik berkualitas tinggi.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href={SITE.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-gold hover:border-gold/50 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href={SITE.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-gold hover:border-gold/50 transition-all hover:scale-110"
                aria-label="TikTok"
              >
                <ExternalLink size={16} />
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-green-400 hover:border-green-500/50 transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-gold inline-block" />
                {section}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--text-muted)] hover:text-gold transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} HAISEN OFFICIAL. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            Dibuat dengan <Heart size={11} className="text-gold animate-float" fill="currentColor" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
