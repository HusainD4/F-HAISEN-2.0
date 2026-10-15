'use client';
// ============================================================
// src/hooks/use_cart.ts
// Cart Hook — keranjang belanja dengan persist di secure_storage
// Validasi integritas harga: harga ditentukan dari backend saat checkout,
// BUKAN dari nilai yang disimpan di cart (anti-price tampering).
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { secureGet, secureSet, secureRemove, STORAGE_KEYS } from '@/security/secure_storage';
import type { CartItem } from '@/types/product';

const MAX_QTY_PER_ITEM = 99;

// ── State Singleton ──────────────────────────────────────────
let _cartItems: CartItem[] = secureGet<CartItem[]>(STORAGE_KEYS.CART) ?? [];
const _cartListeners = new Set<() => void>();

function setCartState(items: CartItem[]) {
  _cartItems = items;
  secureSet(STORAGE_KEYS.CART, items);
  _cartListeners.forEach((fn) => fn());
}

// ── Hook ─────────────────────────────────────────────────────

export function useCart() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const notify = () => rerender((n) => n + 1);
    _cartListeners.add(notify);
    return () => { _cartListeners.delete(notify); };
  }, []);

  /** Tambahkan item ke cart. Jika sudah ada, increment quantity. */
  const addItem = useCallback((item: CartItem | (import('@/types/product').Product & { quantity?: number }), qty = 1) => {
    const cartItem: CartItem = 'product_id' in item
      ? item
      : {
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || qty,
          thumbnail_url: item.thumbnail_url,
          product_type: item.product_type,
        };

    const existing = _cartItems.find((c) => c.product_id === cartItem.product_id);
    if (existing) {
      const updated = _cartItems.map((c) =>
        c.product_id === cartItem.product_id
          ? { ...c, quantity: Math.min(c.quantity + cartItem.quantity, MAX_QTY_PER_ITEM) }
          : c
      );
      setCartState(updated);
    } else {
      setCartState([..._cartItems, { ...cartItem, quantity: Math.min(cartItem.quantity, MAX_QTY_PER_ITEM) }]);
    }
  }, []);

  /** Update quantity item (set langsung). qty <= 0 → hapus item. */
  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCartState(_cartItems.filter((c) => c.product_id !== productId));
    } else {
      setCartState(
        _cartItems.map((c) =>
          c.product_id === productId
            ? { ...c, quantity: Math.min(qty, MAX_QTY_PER_ITEM) }
            : c
        )
      );
    }
  }, []);

  /** Hapus satu item dari cart */
  const removeItem = useCallback((productId: string) => {
    setCartState(_cartItems.filter((c) => c.product_id !== productId));
  }, []);

  /** Kosongkan seluruh cart */
  const clearCart = useCallback(() => {
    secureRemove(STORAGE_KEYS.CART);
    setCartState([]);
  }, []);

  /** Total harga (display only — harga final dari backend) */
  const subtotal = _cartItems.reduce((sum, c) => sum + c.price * c.quantity, 0);

  /** Total jumlah item */
  const totalItems = _cartItems.reduce((sum, c) => sum + c.quantity, 0);

  /** Cek apakah cart mengandung item fisik (butuh data pengiriman) */
  const hasPhysicalItems = _cartItems.some((c) => c.product_type === 'physical');

  return {
    items: _cartItems,
    totalItems,
    subtotal,
    hasPhysicalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isEmpty: _cartItems.length === 0,
  };
}
