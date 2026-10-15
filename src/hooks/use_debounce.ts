'use client';
// ============================================================
// src/hooks/use_debounce.ts
// Debounce Hook — tunda eksekusi sampai input berhenti berubah.
// Gunakan untuk: search input, filter produk (anti spam API).
// ============================================================

import { useState, useEffect } from 'react';

/**
 * Mengembalikan nilai yang di-debounce setelah delay (ms).
 * @param value - nilai yang berubah-ubah (misal: input pencarian)
 * @param delay - waktu tunda dalam milidetik (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
