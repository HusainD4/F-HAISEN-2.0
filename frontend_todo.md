# 🗂️ Frontend Development TODO — Haisen Official Store

> **Stack:** Next.js 14 (App Router) · TypeScript · TailwindCSS · Axios · Zod  
> **Domain:** `store.haisen.my.id`

---

## ✅ TAHAP 1 — Fondasi Tipe Data & Konfigurasi

### Types (`src/types/`)
- [x] `api.ts` — `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>`
- [x] `auth.ts` — `User`, `UserRole`, `LoginPayload`, `RegisterPayload`, `AuthState`
- [x] `product.ts` — `Product`, `ProductCategory`, `ProductAsset`, `CartItem`, `ProductType`
- [x] `order.ts` — `Order`, `OrderItem`, `OrderStatus`, `CheckoutPayload`, `DirectBuyPayload`
- [x] `payment.ts` — `SnapTokenResponse`, `PaymentStatus`, `PaymentStatusResponse`

### Config (`src/config/`)
- [x] `env.ts` — Validasi env vars via Zod (NEXT_PUBLIC_ only)
- [x] `site.ts` — Metadata toko, SEO, URL canonical
- [x] `constants.ts` — ROLES, ORDER_STATUS, PAYMENT_STATUS, API_ENDPOINTS

---

## ✅ TAHAP 2 — Security Layer

### Security (`src/security/`)
- [x] `token_manager.ts` — In-memory JWT store (anti XSS, no localStorage)
- [x] `sanitizer.ts` — DOMPurify wrapper (anti-XSS injection)
- [x] `csrf.ts` — CSRF header helper (X-Requested-With)
- [x] `secure_storage.ts` — XOR-encoded localStorage untuk cart & preferensi
- [x] `csp_headers.ts` — CSP + Security headers untuk middleware

---

## ✅ TAHAP 3 — API Client & Service Layer

### Services (`src/services/`)
- [x] `api_client.ts` — Axios instance + silent token refresh queue + CSRF inject
- [x] `error_handler.ts` — Error masking dengan pesan Indonesia yg aman
- [x] `auth_api.ts` — login, register, logout, me, forgot/reset password
- [x] `product_api.ts` — list, detail, categories, admin CRUD + upload
- [x] `order_api.ts` — checkout, direct-buy, history, admin order management
- [x] `payment_api.ts` — snap token, payment status polling
- [x] `user_api.ts` — profil user, ganti password, admin user management

---

## ✅ TAHAP 4 — Utils & Validators

### Utils (`src/utils/`)
- [x] `formatters.ts` — formatRupiah, formatDate, formatRelativeTime, formatOrderStatus, formatPaymentStatus, formatProductType, formatFileSize
- [x] `validators.ts` — Zod schemas: Login, Register, ForgotPassword, ResetPassword, UpdateProfile, ChangePassword, CheckoutPhysical, CheckoutDigital

---

## ✅ TAHAP 5 — Custom Hooks

### Hooks (`src/hooks/`)
- [x] `use_auth.ts` — auth state singleton, login, logout, hydrate, hasRole, hasPermission, refreshUser
- [x] `use_cart.ts` — cart persist (secure_storage), addItem, updateQuantity, removeItem, clearCart, hasPhysicalItems
- [x] `use_debounce.ts` — generic debounce hook (default 400ms)

---

## ✅ TAHAP 6 — UI Components

### Common (`src/components/common/`)
- [x] `navbar.tsx` — Navbar responsif (logo, search, cart icon, user menu, role-aware)
- [x] `footer.tsx` — Footer toko (links, sosmed, copyright)
- [x] `error_boundary.tsx` — React Error Boundary (prevent UI crash leak)

### UI Atoms (`src/components/ui/`)
- [x] `button.tsx` — Button dengan variants (primary, secondary, danger, loading state)
- [x] `input.tsx` — Input + auto-sanitasi + error message
- [x] `modal.tsx` — Modal/Dialog reusable
- [x] `toast.tsx` — Toast notification (success, error, info)
- [x] `badge.tsx` — Badge status order/payment

### Guards (`src/components/guards/`)
- [x] `auth_guard.tsx` — Redirect ke login jika belum auth
- [x] `role_guard.tsx` — Blokir akses berdasarkan role
- [x] `guest_guard.tsx` — Redirect ke dashboard jika sudah login

---

## ✅ TAHAP 7 — Middleware

- [x] `src/middleware.ts` — Route protection + security headers (CSP, X-Frame, HSTS)

---

## ✅ TAHAP 8 — Pages (App Router)

### Root
- [x] `app/layout.tsx` — Root layout (font, metadata, theme)
- [x] `app/page.tsx` — Homepage / Landing Page

### Auth `(auth)/`
- [x] `login/page.tsx`
- [x] `register/page.tsx`
- [x] `forgot-password/page.tsx`

### Shop `(shop)/`
- [x] `products/page.tsx` — Katalog produk (grid, filter, pagination)
- [x] `products/[slug]/page.tsx` — Detail produk + tombol beli/langsung beli
- [x] `cart/page.tsx` — Keranjang belanja
- [x] `checkout/page.tsx` — Form checkout (kondisional: fisik vs digital/jasa)

### Dashboard Pembeli `(dashboard)/`
- [x] `dashboard/page.tsx` — Ringkasan akun
- [x] `orders/page.tsx` — Riwayat pesanan
- [x] `downloads/page.tsx` — Download produk digital

### Admin Panel `(admin)/`
- [x] `admin/page.tsx` — Dashboard admin (statistik)
- [x] `admin/products/page.tsx` — CRUD produk
- [x] `admin/orders/page.tsx` — Kelola pesanan
- [x] `admin/users/page.tsx` — Kelola user

---

## 📌 Catatan Penting

| Kondisi Checkout | Field Wajib |
|---|---|
| Produk **Fisik** | address, province, city, district, postal_code, courier, courier_service, shipping_cost |
| Produk **Digital/Jasa** | Hanya data user login + order_note (opsional) |

> Pertanyaan untuk lanjut ke **Tahap 2**:  
> 1. Apakah cart perlu **persist** setelah halaman di-refresh? (pakai encrypted localStorage)  
> 2. Apakah perlu integrasi **RajaOngkir** di frontend untuk kalkulasi ongkir? (butuh API key)
