// ============================================================
// src/services/error_handler.ts
// Error Parser & Masker
// Mencegah stack trace / info internal server bocor ke UI.
// ============================================================

import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export interface ParsedError {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
}

/**
 * Parse error apapun menjadi format yang aman ditampilkan ke user.
 * Stack trace & detail internal TIDAK pernah diteruskan ke UI.
 */
export function parseApiError(error: unknown): ParsedError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Error dari backend (structured response: message atau detail dari FastAPI)
    if (data && typeof data === 'object') {
      const raw = data as unknown as Record<string, unknown>;
      const backendMsg =
        raw.message ||
        (typeof raw.detail === 'string'
          ? raw.detail
          : undefined);

      if (backendMsg) {
        return {
          message: String(backendMsg),
          code: data.error_code,
          fieldErrors: data.errors,
          status,
        };
      }
    }

    // HTTP error tanpa body
    return {
      message: getHttpStatusMessage(status),
      status,
    };
  }

  // Network error / timeout
  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      return { message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.' };
    }
    // Jangan expose error.message mentah ke user
  }

  return { message: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.' };
}

function getHttpStatusMessage(status?: number): string {
  switch (status) {
    case 400: return 'Permintaan tidak valid. Periksa kembali data yang dikirim.';
    case 401: return 'Sesi Anda telah berakhir. Silakan login kembali.';
    case 403: return 'Anda tidak memiliki akses untuk melakukan tindakan ini.';
    case 404: return 'Data yang diminta tidak ditemukan.';
    case 409: return 'Data sudah ada atau terjadi konflik.';
    case 422: return 'Format data tidak valid.';
    case 429: return 'Terlalu banyak permintaan. Silakan tunggu sebentar.';
    case 500: return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    case 503: return 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.';
    default:  return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}
