// ============================================================
// src/security/sanitizer.ts
// Input & Rich Text Sanitizer (Anti-XSS)
// Menggunakan DOMPurify untuk membersihkan input sebelum dirender.
// ============================================================

import DOMPurify from 'dompurify';

/**
 * Sanitasi string HTML/rich-text.
 * Gunakan untuk output yang akan dirender sebagai innerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip semua tag
    return dirty.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitasi plain text — strip semua tag & karakter berbahaya.
 * Gunakan untuk input form sebelum dikirim ke backend.
 */
export function sanitizeText(input: string): string {
  if (typeof window === 'undefined') {
    return input.replace(/<[^>]*>/g, '').trim();
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitasi URL — pastikan hanya http/https yang lolos.
 * Mencegah javascript: protocol injection.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
    return parsed.toString();
  } catch {
    return '#';
  }
}
