// ============================================================
// src/services/order_api.ts
// Order API — Checkout, Direct Buy, Riwayat Pesanan
// ============================================================

import { apiClient } from './api_client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Order, CheckoutPayload, DirectBuyPayload } from '@/types/order';

/** Checkout dari keranjang belanja */
export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders/checkout', payload);
  return data.data;
}

/** Beli langsung 1 produk (tanpa cart) */
export async function directBuy(payload: DirectBuyPayload): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders/direct-buy', payload);
  return data.data;
}

/** Ambil riwayat pesanan user yang login */
export async function fetchMyOrders(page = 1, perPage = 10): Promise<PaginatedResponse<Order>> {
  const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders', {
    params: { page, per_page: perPage },
  });
  return data;
}

/** Ambil detail satu order */
export async function fetchOrderDetail(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
  return data.data;
}

// ── Admin ────────────────────────────────────────────────────

/** [Admin] Ambil semua order (semua user) */
export async function fetchAllOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<Order>> {
  const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders/admin/all', { params });
  return data;
}

/** [Admin] Update status order */
export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
  return data.data;
}
