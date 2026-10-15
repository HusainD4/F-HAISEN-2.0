import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FILES = {
    # Documentation file
    "struktur-folder.txt": '''haisen-store-frontend/
│
├── public/                      # Static Assets (favicon, logo, icons, robots.txt)
│   ├── robots.txt               # Aturan crawling SEO & proteksi direktori sensitif
│   └── sitemap.xml              # Sitemap XML untuk indexing produk
│
├── src/
│   ├── config/                  # Konfigurasi Global & Validasi Lingkungan
│   │   ├── env.ts               # Validasi Environment Variables (Zod schema - Anti Leakage)
│   │   ├── site.ts              # Metadata Toko, SEO, OpenGraph, Canonical URLs
│   │   └── constants.ts         # Konstanta Role, API Endpoints, Payment Status
│   │
│   ├── security/                # Layer Keamanan Tingkat Tinggi (Anti-Peretasan)
│   │   ├── token_manager.ts     # Manajemen Token JWT In-Memory (Anti-XSS LocalStorage Theft)
│   │   ├── sanitizer.ts         # Sanitasi Input & Rich Text (DOMPurify - Anti-XSS Injection)
│   │   ├── csrf.ts              # Handling Header Anti-CSRF Token
│   │   ├── csp_headers.ts       # Content Security Policy (Anti-Clickjacking & Data Exfiltration)
│   │   └── secure_storage.ts    # Enkripsi data storage lokal untuk data non-sensitif
│   │
│   ├── services/                # API Client & Komunikasi Backend (Layer Terisolasi)
│   │   ├── api_client.ts        # Axios/Fetch Instance dengan Interceptor & Auto-Refresh Token
│   │   ├── error_handler.ts     # Masking Error Sensitif (Mencegah Stack Trace Leak ke User)
│   │   ├── auth_api.ts          # Integrasi Endpoint Login, Register, Refresh, Logout
│   │   ├── product_api.ts       # Integrasi Endpoint Katalog & Detail Produk
│   │   ├── order_api.ts         # Integrasi Endpoint Checkout & Riwayat Pesanan
│   │   ├── payment_api.ts       # Integrasi Snap Midtrans & Polling Status Transaksi
│   │   └── user_api.ts          # Integrasi Profil & Manajemen User
│   │
│   ├── components/              # Komponen UI Reusable
│   │   ├── common/              # Navbar, Footer, Error Boundary, Notification Banner
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── error_boundary.tsx # Mencegah UI crash & kebocoran info bug
│   │   ├── ui/                  # Atomic Design (Button, Input, Modal, Badge, Toast)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx        # Input field dengan auto-sanitasi & anti-injection
│   │   │   ├── modal.tsx
│   │   │   └── toast.tsx
│   │   └── guards/              # Proteksi Akses Route Berdasarkan Role
│   │       ├── auth_guard.tsx   # Guard untuk halaman yang wajib login
│   │       ├── role_guard.tsx   # Guard Role-Based (Superadmin, Admin, Staff, User)
│   │       └── guest_guard.tsx  # Mencegah user login mengakses halaman register/login
│   │
│   ├── hooks/                   # Custom Hooks
│   │   ├── use_auth.ts          # Hook autentikasi, status session & permission
│   │   ├── use_cart.ts          # Hook keranjang belanja dengan validasi integritas harga
│   │   └── use_debounce.ts      # Debounce input pencarian (Anti-Spam / Rate-Limit client)
│   │
│   ├── types/                   # Definisi Type TypeScript Ketat (Type Safety)
│   │   ├── auth.ts              # Tipe User, Token, Session, Roles
│   │   ├── product.ts           # Tipe Produk, Kategori, Varian Digital
│   │   ├── order.ts             # Tipe Order, Item, Status Checkout
│   │   ├── payment.ts           # Tipe Midtrans Snap Token & Status
│   │   └── api.ts               # Generic API Response & Error Response
│   │
│   ├── utils/                   # Fungsi Helper & Formatters
│   │   ├── formatters.ts        # Format Rupiah & Tanggal Indonesia
│   │   └── validators.ts        # Skema validasi form Zod (Validasi di sisi Client)
│   │
│   ├── middleware.ts            # Next.js / Edge Middleware (Route Protection & Security Headers)
│   │
│   └── app/                     # Routing Berbasis App Router
│       ├── layout.tsx           # Root Layout (Inject Security Headers & Theme)
│       ├── page.tsx             # Homepage / Landing Page Toko Digital
│       │
│       ├── (auth)/              # Route Group Autentikasi
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   └── forgot-password/page.tsx
│       │
│       ├── (shop)/              # Route Group Toko & Checkout
│       │   ├── products/page.tsx
│       │   ├── products/[slug]/page.tsx
│       │   ├── cart/page.tsx
│       │   └── checkout/page.tsx
│       │
│       ├── (dashboard)/         # Route Group Dashboard Pembeli
│       │   ├── dashboard/page.tsx
│       │   ├── orders/page.tsx
│       │   └── downloads/page.tsx
│       │
│       └── (admin)/             # Route Group Panel Admin (Protected Multi-Role)
│           ├── admin/page.tsx
│           ├── admin/products/page.tsx
│           ├── admin/orders/page.tsx
│           └── admin/users/page.tsx
│
├── .env.example                 # Template Env aman (tanpa rahasia sensitif)
├── .env.local                   # Environment lokal Frontend
├── next.config.js               # Konfigurasi Hardened Security Headers (CSP, HSTS, X-Frame)
├── tsconfig.json                # TypeScript Strict Mode Configuration
├── tailwind.config.ts           # Styling Configuration
└── package.json                 # Dependencies Frontend
''',

    # src/config
    "src/config/env.ts": '''/**
 * Modul: Environment Variables Validation
 * Fungsi Keamanan:
 * - Memvalidasi semua variabel lingkungan menggunakan Zod saat build/runtime.
 * - Mencegah variabel sensitif backend (secret keys) terpapar di sisi client browser.
 * - Hanya mengizinkan variabel dengan prefix NEXT_PUBLIC_ yang boleh diakses client.
 *
 * Isi yang diharapkan:
 * - Skema Zod untuk NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, dll.
 * - Export variabel env terverifikasi.
 */
''',
    "src/config/site.ts": '''/**
 * Modul: Site Metadata & SEO Config
 * Fungsi:
 * - Konfigurasi identitas toko, nama, deskripsi, URL kanonikal, dan OpenGraph.
 *
 * Isi yang diharapkan:
 * - siteConfig object (name, description, url, ogImage, links)
 */
''',
    "src/config/constants.ts": '''/**
 * Modul: Application Constants
 * Fungsi:
 * - Menyimpan nilai konstan yang digunakan di seluruh aplikasi frontend.
 *
 * Isi yang diharapkan:
 * - Roles enum: SUPERADMIN, ADMIN, STAFF, USER
 * - Endpoints URL backend
 * - Status pesanan & pembayaran
 */
''',

    # src/security
    "src/security/token_manager.ts": '''/**
 * Modul: Secure In-Memory Token Manager
 * Fungsi Keamanan (Anti-XSS & Anti-Token Theft):
 * - Mencegah penyimpanan Access Token JWT di LocalStorage / SessionStorage yang rentan XSS.
 * - Menyimpan Access Token hanya di memori variabel runtime (closure).
 * - Refresh Token dikelola via HttpOnly Secure SameSite Cookie oleh backend.
 *
 * Isi yang diharapkan:
 * - setAccessToken(token: string): void
 * - getAccessToken(): string | null
 * - clearAccessToken(): void
 */
''',
    "src/security/sanitizer.ts": '''/**
 * Modul: HTML & Input Sanitizer
 * Fungsi Keamanan (Anti-XSS & Code Injection):
 * - Mensterilkan string HTML atau input user sebelum dirender ke DOM (menggunakan DOMPurify).
 * - Mencegah serangan stored XSS dari deskripsi produk atau komentar user.
 *
 * Isi yang diharapkan:
 * - sanitizeHtml(dirtyHtml: string): string
 * - sanitizeInput(rawText: string): string
 */
''',
    "src/security/csrf.ts": '''/**
 * Modul: CSRF Protection Helper
 * Fungsi Keamanan (Anti-CSRF Attack):
 * - Memastikan request mutasi (POST, PUT, DELETE) menyertakan token Anti-CSRF header.
 * - Sinkronisasi token CSRF antara cookie dan custom request header.
 *
 * Isi yang diharapkan:
 * - getCsrfToken(): string | null
 * - attachCsrfHeader(headers: Record<string, string>): Record<string, string>
 */
''',
    "src/security/csp_headers.ts": '''/**
 * Modul: Content Security Policy (CSP) Headers
 * Fungsi Keamanan (Anti-Data Exfiltration & Clickjacking):
 * - Mendefinisikan whitelist sumber script, font, koneksi API, dan image yang sah.
 * - Memblokir script inline berbahaya dan mencegah website di-embed di iframe phishing.
 *
 * Isi yang diharapkan:
 * - generateCspDirectives(): string
 * - Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
 */
''',
    "src/security/secure_storage.ts": '''/**
 * Modul: Obfuscated / Encrypted Storage Helper
 * Fungsi Keamanan:
 * - Menyimpan data non-sensitif (misal: preferensi tema atau item keranjang offline)
 *   dengan proteksi integritas checksum untuk mencegah manipulasi data lokal.
 *
 * Isi yang diharapkan:
 * - setSecureItem(key: string, value: any): void
 * - getSecureItem<T>(key: string): T | null
 */
''',

    # src/services
    "src/services/api_client.ts": '''/**
 * Modul: Hardened API Client
 * Fungsi Keamanan:
 * - Instance HTTP Client (Axios/Fetch) dengan proteksi interceptor otomatis.
 * - Menyuntikkan Bearer Token dari token_manager secara aman.
 * - Menangani refresh token otomatis jika response 401 Unauthorized tanpa logout paksa.
 * - Menolak request ke domain asing di luar whitelist API_URL.
 *
 * Isi yang diharapkan:
 * - apiClient instance
 * - requestInterceptor (Inject Authorization & CSRF headers)
 * - responseInterceptor (Auto refresh token & global error parsing)
 */
''',
    "src/services/error_handler.ts": '''/**
 * Modul: Error Masking & Exception Parser
 * Fungsi Keamanan:
 * - Memfilter error dari backend sebelum ditampilkan ke UI.
 * - Mencegah kebocoran struktur database, path server, atau stack trace internal ke pengguna.
 *
 * Isi yang diharapkan:
 * - parseApiError(error: unknown): { message: string, code?: string }
 */
''',
    "src/services/auth_api.ts": '''/**
 * Modul: Auth API Service
 * Fungsi:
 * - Komunikasi dengan backend untuk login, register, logout, dan refresh token session.
 *
 * Isi yang diharapkan:
 * - loginUser(credentials), registerUser(data), logoutUser(), fetchCurrentUser()
 */
''',
    "src/services/product_api.ts": '''/**
 * Modul: Product API Service
 * Fungsi:
 * - Mengambil daftar katalog produk digital, filter kategori, dan detail slug.
 *
 * Isi yang diharapkan:
 * - getProducts(params), getProductBySlug(slug), getCategories()
 */
''',
    "src/services/order_api.ts": '''/**
 * Modul: Order API Service
 * Fungsi:
 * - Mengirim data checkout, mengambil riwayat pesanan, dan link unduhan aset digital.
 *
 * Isi yang diharapkan:
 * - createOrder(orderPayload), getOrderHistory(), getOrderDetail(orderId), getDownloadLink(assetId)
 */
''',
    "src/services/payment_api.ts": '''/**
 * Modul: Payment API Service
 * Fungsi:
 * - Meminta Snap Token Midtrans dari backend dan verifikasi status pembayaran.
 *
 * Isi yang diharapkan:
 * - getSnapToken(orderId), checkPaymentStatus(orderId)
 */
''',
    "src/services/user_api.ts": '''/**
 * Modul: User API Service
 * Fungsi:
 * - Manajemen profil pengguna, ganti password, dan manajemen user untuk admin.
 *
 * Isi yang diharapkan:
 * - getProfile(), updateProfile(data), changePassword(data)
 */
''',

    # src/components/common
    "src/components/common/navbar.tsx": '''/**
 * Komponen: Global Navbar
 * Fungsi:
 * - Navigasi utama toko, status login user, ikon keranjang belanja, dan menu profil/admin.
 */
''',
    "src/components/common/footer.tsx": '''/**
 * Komponen: Global Footer
 * Fungsi:
 * - Link informasi legal, syarat & ketentuan, privasi, dan media sosial Haisen Official.
 */
''',
    "src/components/common/error_boundary.tsx": '''/**
 * Komponen: React Error Boundary
 * Fungsi Keamanan:
 * - Menangkap runtime crash pada UI dan menampilkan fallback halaman ramah user.
 * - Mencegah kebocoran stack trace error sensitif ke layar publik.
 */
''',

    # src/components/ui
    "src/components/ui/button.tsx": '''/**
 * Komponen UI: Button
 * Fungsi: Tombol interaktif dengan varian primer, sekunder, outline, bahaya, dan state loading.
 */
''',
    "src/components/ui/input.tsx": '''/**
 * Komponen UI: Input Field
 * Fungsi Keamanan:
 * - Input text/password/email dengan sanitasi karakter berbahaya dan label aksesibilitas (a11y).
 */
''',
    "src/components/ui/modal.tsx": '''/**
 * Komponen UI: Modal Dialog
 * Fungsi: Pop-up dialog untuk konfirmasi pembayaran, checkout, atau pop-up detail produk.
 */
''',
    "src/components/ui/toast.tsx": '''/**
 * Komponen UI: Toast Notification
 * Fungsi: Notifikasi popup sukses, error, atau info kepada pengguna.
 */
''',

    # src/components/guards
    "src/components/guards/auth_guard.tsx": '''/**
 * Komponen Guard: Auth Guard
 * Fungsi Keamanan:
 * - Memproteksi route yang memerlukan status login (misal: dashboard, riwayat order).
 * - Me-redirect user non-autentikasi ke halaman /login dengan parameter callback url.
 */
''',
    "src/components/guards/role_guard.tsx": '''/**
 * Komponen Guard: Multi-Role Authorization Guard
 * Fungsi Keamanan:
 * - Memastikan hanya role tertentu (Superadmin / Admin / Staff) yang dapat mengakses area admin.
 * - Menampilkan 403 Forbidden atau redirect jika user tidak memiliki izin hak akses.
 */
''',
    "src/components/guards/guest_guard.tsx": '''/**
 * Komponen Guard: Guest Guard
 * Fungsi Keamanan:
 * - Mencegah user yang sudah login mengakses halaman login atau registrasi kembali.
 */
''',

    # src/hooks
    "src/hooks/use_auth.ts": '''/**
 * Custom Hook: useAuth
 * Fungsi:
 * - Menyediakan state session user, status autentikasi, fungsi login, logout, dan izin role.
 */
''',
    "src/hooks/use_cart.ts": '''/**
 * Custom Hook: useCart
 * Fungsi Keamanan:
 * - Manajemen keranjang belanja lokal.
 * - Hanya menyimpan ID produk dan kuantitas (Harga final selalu diverifikasi ulang di backend).
 */
''',
    "src/hooks/use_debounce.ts": '''/**
 * Custom Hook: useDebounce
 * Fungsi Keamanan & Kinerja:
 * - Menunda eksekusi input pencarian untuk menghemat resource dan mencegah flooding API backend.
 */
''',

    # src/types
    "src/types/auth.ts": '''/**
 * Type Definitions: Auth & User Session
 * Isi:
 * - Interface User, UserRole (superadmin, admin, staff, user), LoginPayload, AuthState
 */
''',
    "src/types/product.ts": '''/**
 * Type Definitions: Product & Category
 * Isi:
 * - Interface Product, ProductCategory, ProductAsset, ProductFilter
 */
''',
    "src/types/order.ts": '''/**
 * Type Definitions: Order & Checkout
 * Isi:
 * - Interface Order, OrderItem, CheckoutPayload, OrderStatus
 */
''',
    "src/types/payment.ts": '''/**
 * Type Definitions: Payment & Midtrans
 * Isi:
 * - Interface SnapTokenResponse, MidtransPaymentResult, PaymentStatus
 */
''',
    "src/types/api.ts": '''/**
 * Type Definitions: Generic API
 * Isi:
 * - Interface ApiResponse<T>, ApiErrorResponse, PaginatedResponse<T>
 */
''',

    # src/utils
    "src/utils/formatters.ts": '''/**
 * Utility: Formatters
 * Fungsi:
 * - formatRupiah(number): string (Contoh: Rp 150.000)
 * - formatDateId(string | Date): string (Format tanggal Indonesia)
 */
''',
    "src/utils/validators.ts": '''/**
 * Utility: Zod Form Validation Schemas
 * Fungsi Keamanan:
 * - Validasi ketat format email, kekuatan password, sanitasi nomor HP sebelum kirim ke API.
 * - Skema: loginSchema, registerSchema, checkoutSchema, profileUpdateSchema
 */
''',

    # src/middleware.ts
    "src/middleware.ts": '''/**
 * Middleware: Next.js Edge Security Middleware
 * Fungsi Keamanan Tingkat Edge:
 * 1. Injeksi Header Keamanan (CSP, X-Frame-Options: DENY, HSTS, X-Content-Type-Options: nosniff).
 * 2. Route Protection: Memeriksa session token sebelum request mencapai halaman internal.
 * 3. Sanitasi URL dan penolakan bot/crawler pada endpoint sensitif.
 */
''',

    # src/app
    "src/app/layout.tsx": '''/**
 * App: Root Layout
 * Fungsi:
 * - Layout induk seluruh aplikasi frontend, pembungkus ThemeProvider, AuthProvider, ToastProvider.
 */
''',
    "src/app/page.tsx": '''/**
 * App: Homepage / Landing Page
 * Fungsi:
 * - Menampilkan hero banner, produk digital terpopuler, keunggulan layanan, dan testimoni.
 */
''',

    # (auth)
    "src/app/(auth)/login/page.tsx": '''/**
 * Halaman: Login
 * Fungsi: Form login pengguna dengan proteksi rate limit input dan CSRF.
 */
''',
    "src/app/(auth)/register/page.tsx": '''/**
 * Halaman: Register
 * Fungsi: Form registrasi pengguna baru dengan validasi password kuat.
 */
''',
    "src/app/(auth)/forgot-password/page.tsx": '''/**
 * Halaman: Lupa Password
 * Fungsi: Form permintaan reset link password ke email terdaftar.
 */
''',

    # (shop)
    "src/app/(shop)/products/page.tsx": '''/**
 * Halaman: Katalog Produk
 * Fungsi: Menampilkan grid produk digital dengan filter kategori, pencarian, dan sorting harga.
 */
''',
    "src/app/(shop)/products/[slug]/page.tsx": '''/**
 * Halaman: Detail Produk Digital
 * Fungsi: Menampilkan deskripsi lengkap produk, preview, dan tombol Tambah ke Keranjang / Beli Sekarang.
 */
''',
    "src/app/(shop)/cart/page.tsx": '''/**
 * Halaman: Keranjang Belanja
 * Fungsi: Ringkasan produk yang dipilih sebelum melanjutkan ke pembayaran.
 */
''',
    "src/app/(shop)/checkout/page.tsx": '''/**
 * Halaman: Checkout Transaksi
 * Fungsi: Form data pembeli dan trigger popup Snap Midtrans untuk pembayaran instan.
 */
''',

    # (dashboard)
    "src/app/(dashboard)/dashboard/page.tsx": '''/**
 * Halaman: User Dashboard (Protected)
 * Fungsi: Ringkasan akun pengguna, status pesanan aktif, dan link unduhan digital.
 */
''',
    "src/app/(dashboard)/orders/page.tsx": '''/**
 * Halaman: Riwayat Pesanan (Protected)
 * Fungsi: Daftar seluruh transaksi belanja beserta status lunas / menunggu pembayaran.
 */
''',
    "src/app/(dashboard)/downloads/page.tsx": '''/**
 * Halaman: Akses Produk Digital & Lisensi (Protected)
 * Fungsi: Mengakses link download file digital dan kode lisensi resmi yang telah dibeli.
 */
''',

    # (admin)
    "src/app/(admin)/admin/page.tsx": '''/**
 * Halaman: Admin Dashboard (Protected - Role: Admin/Superadmin)
 * Fungsi: Metrik penjualan, total pendapatan, grafik transaksi, dan order terbaru.
 */
''',
    "src/app/(admin)/admin/products/page.tsx": '''/**
 * Halaman: Manajemen Produk Admin (Protected)
 * Fungsi: CRUD katalog produk, upload aset digital, manajemen lisensi, dan update harga.
 */
''',
    "src/app/(admin)/admin/orders/page.tsx": '''/**
 * Halaman: Manajemen Transaksi Admin (Protected)
 * Fungsi: Monitoring transaksi masuk, audit pembayaran Midtrans, dan pengiriman manual jika perlu.
 */
''',
    "src/app/(admin)/admin/users/page.tsx": '''/**
 * Halaman: Manajemen Pengguna & Multi-Role (Protected - Role: Superadmin)
 * Fungsi: Mengelola daftar pengguna dan penetapan role (Superadmin, Admin, Staff, User).
 */
''',

    # public
    "public/robots.txt": '''# Robots.txt - Haisen Official Store
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /downloads
Disallow: /checkout
Disallow: /api/

Sitemap: https://store.haisenofficial.com/sitemap.xml
''',
    "public/sitemap.xml": '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://store.haisenofficial.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://store.haisenofficial.com/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
''',

    # Root config files
    ".env.example": '''# Frontend Environment Variables (Aman - Tanpa Rahasia Backend)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
''',
    ".env.local": '''# Frontend Local Environment
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
''',

    "next.config.js": '''/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hilangkan header X-Powered-By: Next.js (Anti-Fingerprinting)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS (HSTS)
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Proteksi Anti-Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Mencegah MIME-sniffing exploit
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Nonaktifkan hardware sensor yang tidak perlu
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com; connect-src 'self' http://localhost:8000 https://api.haisenofficial.com https://app.sandbox.midtrans.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://app.sandbox.midtrans.com https://app.midtrans.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
''',

    "tsconfig.json": '''{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
''',

    "package.json": '''{
  "name": "haisen-store-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.6.8",
    "zod": "^3.22.4",
    "dompurify": "^3.0.9",
    "lucide-react": "^0.363.0"
  },
  "devDependencies": {
    "typescript": "^5.4.3",
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.70",
    "@types/react-dom": "^18.2.22",
    "@types/dompurify": "^3.0.5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  }
}
'''
}

def main():
    created = []
    for rel_path, content in FILES.items():
        abs_path = os.path.join(BASE_DIR, rel_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        created.append(rel_path)
    print(f"Sukses membuat {len(created)} file dan folder frontend.")

if __name__ == "__main__":
    main()
