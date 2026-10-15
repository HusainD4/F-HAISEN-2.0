// ============================================================
// src/services/payment_api.ts
// Payment API — Midtrans Snap Token & Status Polling
// ============================================================

import { apiClient } from './api_client';
import type { ApiResponse } from '@/types/api';
import type { SnapTokenResponse, PaymentStatusResponse } from '@/types/payment';

/** Minta Snap Token Midtrans untuk order tertentu */
export async function getSnapToken(orderId: string): Promise<SnapTokenResponse> {
  const { data } = await apiClient.post<ApiResponse<SnapTokenResponse>>(
    '/payments/snap-token',
    { order_id: orderId }
  );
  return data.data;
}

/** Cek status pembayaran suatu order */
export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  const { data } = await apiClient.get<ApiResponse<PaymentStatusResponse>>(
    `/payments/status/${orderId}`
  );
  return data.data;
}
