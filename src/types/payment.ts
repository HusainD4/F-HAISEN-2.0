// ============================================================
// src/types/payment.ts
// Midtrans Snap & Transaction Status Types
// ============================================================

/** Status transaksi dari Midtrans */
export type PaymentStatus =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'refund'
  | 'partial_refund'
  | 'chargeback';

/** Snap Token response dari backend */
export interface SnapTokenResponse {
  snap_token: string;
  order_id: string;
  redirect_url: string;
}

/** Notifikasi status pembayaran dari backend */
export interface PaymentStatusResponse {
  order_id: string;
  order_number: string;
  payment_status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
}
