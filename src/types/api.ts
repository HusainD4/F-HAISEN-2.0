// ============================================================
// src/types/api.ts
// Generic API Response & Error Types
// ============================================================

/** Standard sukses response dari backend */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

/** Standard error response dari backend */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
}

/** Response paginated (list produk, order, dll) */
export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  items?: T[];
  total?: number;
  total_pages?: number;
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/** Union type untuk handle sukses/gagal */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
