'use client';
// ============================================================
// src/components/common/navbar.tsx
// Navbar Premium:
// - Desktop: full-width header → menyusut jadi floating island saat scroll
// - Mobile: top bar + sidebar drawer
// - Dropdown menu per kategori
// - Dark/Light toggle, cart icon, user menu
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, Menu, X, Sun, Moon, User, LogOut,
  LayoutDashboard, Package, ChevronDown, Search, Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/use_auth';
import { useCart } from '@/hooks/use_cart';
import { SITE } from '@/config/site';
import { ADMIN_ROLES } from '@/config/constants';
import { toast } from '@/components/ui/toast';

// ── Nav Links ────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Beranda',  href: '/' },
  {
    label: 'Produk',
    href: '/products',
    children: [
      { label: 'Semua Produk', href: '/products' },
      { label: 'Produk Digital', href: '/products?type=digital' },
      { label: 'Jasa', href: '/products?type=service' },
      { label: 'Barang Fisik', href: '/products?type=physical' },
    ],
  },
  { label: 'Tentang',  href: '/#about' },
  { label: 'Kontak',   href: '/#contact' },
];

// ── Theme Toggle ─────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hso_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('hso_theme', next ? 'dark' : 'light');
  };

  return { dark, toggle };
}

// ── Dropdown Menu ────────────────────────────────────────────

function DropdownMenu({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="absolute top-full left-0 mt-2 w-52 card py-1.5 z-50 animate-scale-in">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeDropdown, setActive]     = useState<string | null>(null);
  const [userMenuOpen, setUserMenu]     = useState(false);
  const { dark, toggle: toggleTheme }   = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems }                  = useCart();
  const pathname                        = usePathname();
  const router                          = useRouter();
  const dropdownRef                     = useRef<HTMLDivElement>(null);

  // Scroll shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setActive(null);
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
      toast.success('Sampai jumpa!', 'Anda telah berhasil logout.');
      router.push('/');
    } catch {
      toast.error('Gagal logout', 'Silakan coba lagi.');
    }
  }

  const isAdmin = isAuthenticated && user?.role?.slug && ADMIN_ROLES.includes(user.role.slug as never);

  // ── Navbar container class (shrink on scroll) ────────────────
  const containerClass = scrolled
    ? // Floating island
      'fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-2xl px-5 py-3 shadow-dark-lg glass dark:glass transition-all duration-300 ease-out'
    : // Full width header
      'fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md transition-all duration-300 ease-out';

  return (
    <>
      {/* ── Desktop Navbar ──────────────────────────────────── */}
      <nav className={containerClass} ref={dropdownRef}>
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-gold-sm group-hover:scale-110 transition-transform duration-200">
              <span className="text-charcoal-900 font-black text-sm">H</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-black tracking-widest text-gold uppercase">HAISEN</p>
              <p className="text-[9px] text-[var(--text-muted)] tracking-wider uppercase -mt-0.5">Official</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button
                  className={[
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    pathname === link.href
                      ? 'text-gold bg-gold/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)]',
                  ].join(' ')}
                  onClick={() => {
                    if (link.children) {
                      setActive(activeDropdown === link.label ? null : link.label);
                    } else {
                      router.push(link.href);
                    }
                  }}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                {link.children && activeDropdown === link.label && (
                  <DropdownMenu items={link.children} />
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/products"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all hidden sm:flex"
              aria-label="Cari produk"
            >
              <Search size={18} />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all"
              aria-label="Toggle tema"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart — Hanya tampil saat sudah login */}
            {isAuthenticated && (
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all duration-200"
                aria-label="Keranjang belanja"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-charcoal-900 text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-gold/50 transition-all text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <User size={12} className="text-gold" />
                  </div>
                  <span className="hidden sm:block text-[var(--text)] text-xs font-medium max-w-[80px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={`text-[var(--text-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card py-1.5 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-[var(--border)] mb-1">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">{user?.full_name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-colors">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-colors">
                      <Package size={14} /> Pesanan Saya
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gold hover:bg-gold/10 transition-colors">
                        <Shield size={14} /> Panel Admin
                      </Link>
                    )}
                    <div className="border-t border-[var(--border)] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold bg-gold text-charcoal-900 rounded-xl hover:bg-gold-400 hover:scale-105 transition-all shadow-gold-sm active:scale-95"
              >
                Masuk
              </Link>
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for non-floating state */}
      {!scrolled && <div className="h-[65px]" />}

      {/* ── Mobile Sidebar Drawer ───────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-72 bg-[var(--bg-card)] z-[70] flex flex-col shadow-dark-lg animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center">
                  <span className="text-charcoal-900 font-black text-xs">H</span>
                </div>
                <span className="text-xs font-black tracking-widest text-gold uppercase">HAISEN</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info (mobile) */}
            {isAuthenticated && (
              <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <User size={16} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{user?.full_name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.role?.name}</p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className={[
                      'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      pathname === link.href
                        ? 'bg-gold/10 text-gold'
                        : 'text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="flex items-center pl-8 pr-4 py-2 text-sm text-[var(--text-muted)] hover:text-gold transition-colors"
                    >
                      — {sub.label}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-[var(--border)] my-2" />

              {isAuthenticated ? (
                <>
                  <Link href="/cart" className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-all">
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={16} /> Keranjang Belanja
                    </span>
                    {totalItems > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-gold text-charcoal-900 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-all">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--text)] hover:bg-[var(--bg-surface)] hover:text-gold transition-all">
                    <Package size={16} /> Pesanan Saya
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gold hover:bg-gold/10 transition-all">
                      <Shield size={16} /> Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gold text-charcoal-900 hover:bg-gold-400 transition-all"
                >
                  Masuk / Daftar
                </Link>
              )}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                {SITE.name}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-all"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
