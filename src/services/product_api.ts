// ============================================================
// src/services/product_api.ts
// Product API — Katalog, Detail, Kategori, Admin CRUD
// ============================================================

import { apiClient } from './api_client';
import type { PaginatedResponse } from '@/types/api';
import type { Product, ProductCategory, ProductFilter } from '@/types/product';

export interface ProductCreatePayload {
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  base_price: number;
  discount_price?: number;
  product_type: 'digital' | 'service' | 'physical';
  category_id?: string;
  is_featured?: boolean;
  is_active?: boolean;
  thumbnail_url?: string;
  banner_image_url?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {}

export interface CategoryCreatePayload {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

/** Ambil daftar produk aktif dengan filter & paginasi */
export async function fetchProducts(filter?: ProductFilter): Promise<PaginatedResponse<Product>> {
  const params: Record<string, unknown> = {
    page: filter?.page ?? 1,
    limit: filter?.limit ?? filter?.per_page ?? 12,
  };
  if (filter?.search) params.search = filter.search;
  if (filter?.category || filter?.category_id) params.category = filter.category || filter.category_id;
  if (filter?.featured !== undefined) params.featured = filter.featured;
  if (filter?.sort) params.sort = filter.sort;

  const { data } = await apiClient.get('/products', { params });
  return (data.data ?? data) as PaginatedResponse<Product>;
}

/** Ambil detail produk berdasarkan slug */
export async function fetchProductBySlug(slug: string): Promise<Product> {
  const { data } = await apiClient.get(`/products/detail/${slug}`);
  return (data.data ?? data) as Product;
}

/** Ambil semua kategori produk aktif */
export async function fetchCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get('/products/categories');
  const res = data.data ?? data;
  return Array.isArray(res) ? (res as ProductCategory[]) : [];
}

// ── Admin ────────────────────────────────────────────────────

/** [Admin] Buat produk baru — JSON payload sesuai ProductCreateRequest backend */
export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  const { data } = await apiClient.post('/products', payload);
  return (data.data ?? data) as Product;
}

/** [Admin] Update produk */
export async function updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
  const { data } = await apiClient.put(`/products/${id}`, payload);
  return (data.data ?? data) as Product;
}

/** [Admin] Hapus produk */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

/** [Admin] Buat kategori baru */
export async function createCategory(payload: CategoryCreatePayload): Promise<ProductCategory> {
  const { data } = await apiClient.post('/products/categories', payload);
  return (data.data ?? data) as ProductCategory;
}

/** [Admin] Update kategori */
export async function updateCategory(id: string, payload: Partial<CategoryCreatePayload>): Promise<ProductCategory> {
  const { data } = await apiClient.put(`/products/categories/${id}`, payload);
  return (data.data ?? data) as ProductCategory;
}

/** [Admin] Hapus kategori */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/products/categories/${id}`);
}

