// ============================================================
// src/types/product.ts
// Product, Category & Asset Types
// ============================================================

/** Jenis produk */
export type ProductType = 'physical' | 'digital' | 'service';

/** Kategori produk */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

/** File/asset digital yang terlampir pada produk */
export interface ProductAsset {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

/** Produk di katalog */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number | null; // null = unlimited (digital/service)
  product_type: ProductType;
  is_active: boolean;
  thumbnail_url: string | null;
  category: ProductCategory | null;
  assets: ProductAsset[];
  created_at: string;
}

/** Filter pencarian produk */
export interface ProductFilter {
  search?: string;
  category?: string;
  category_id?: string;
  product_type?: ProductType;
  featured?: boolean;
  sort?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  per_page?: number;
}

/** Item di keranjang belanja (client-side only) */
export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail_url: string | null;
  product_type: ProductType;
}
