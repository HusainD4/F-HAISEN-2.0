// ============================================================
// src/types/order.ts
// Order, Checkout & Status Types
// ============================================================

import type { ProductType } from './product';

/** Status order */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

/** Item dalam order */
export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

/** Data order lengkap */
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  shipping_cost: number;
  items: OrderItem[];
  // Alamat pengiriman snapshot (disimpan saat order dibuat)
  shipping_address: string | null;
  shipping_province: string | null;
  shipping_city: string | null;
  shipping_district: string | null;
  shipping_postal_code: string | null;
  courier: string | null;
  courier_service: string | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload checkout dari keranjang belanja (cart).
 * Produk fisik WAJIB mengisi data pengiriman lengkap.
 * Produk digital/jasa cukup address & note opsional.
 */
export interface CheckoutPayload {
  items: { product_id: string; quantity: number }[];
  // Wajib untuk produk fisik:
  shipping_address?: string;
  shipping_province?: string;
  shipping_city?: string;
  shipping_district?: string;
  shipping_postal_code?: string;
  courier?: string;
  courier_service?: string;
  shipping_cost?: number;
  order_note?: string;
}

/**
 * Payload beli langsung (direct buy - 1 produk).
 */
export interface DirectBuyPayload {
  product_id: string;
  quantity: number;
  shipping_address?: string;
  shipping_province?: string;
  shipping_city?: string;
  shipping_district?: string;
  shipping_postal_code?: string;
  courier?: string;
  courier_service?: string;
  shipping_cost?: number;
  order_note?: string;
}
