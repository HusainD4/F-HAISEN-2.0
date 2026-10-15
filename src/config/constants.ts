// ============================================================
// src/config/constants.ts
// Role, Status & Endpoint Constants
// ============================================================

/** Role slug yang tersedia di sistem */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  FINANCE: 'finance',
  STAFF: 'staff',
  USER: 'user',
} as const;

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES];

/** Status pesanan */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

/** Status pembayaran Midtrans */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SETTLEMENT: 'settlement',
  CAPTURE: 'capture',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire',
  REFUND: 'refund',
} as const;

/** Jenis produk */
export const PRODUCT_TYPE = {
  PHYSICAL: 'physical',
  DIGITAL: 'digital',
  SERVICE: 'service',
} as const;

/** API endpoint paths (tanpa base URL) */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Products
  PRODUCTS: '/products',
  PRODUCT_CATEGORIES: '/products/categories',

  // Orders
  ORDERS: '/orders',
  CHECKOUT: '/orders/checkout',
  DIRECT_BUY: '/orders/direct-buy',

  // Payments
  PAYMENT_SNAP: '/payments/snap-token',
  PAYMENT_STATUS: '/payments/status',

  // Users (admin)
  USERS: '/users',
} as const;

/** Roles yang dianggap sebagai admin panel */
export const ADMIN_ROLES: RoleSlug[] = ['superadmin', 'admin', 'finance', 'staff'];

/** Jumlah item per halaman default */
export const DEFAULT_PAGE_SIZE = 12;
