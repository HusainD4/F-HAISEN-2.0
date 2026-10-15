// ============================================================
// src/config/env.ts
// Environment Variables Validation (Zod)
// Hanya NEXT_PUBLIC_ vars yg boleh diakses client-side.
// ============================================================

import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1),
  NEXT_PUBLIC_MIDTRANS_SNAP_URL: z.string().url(),
});

const _parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  NEXT_PUBLIC_MIDTRANS_SNAP_URL: process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL,
});

if (!_parsed.success) {
  console.error('[ENV] Missing or invalid environment variables:', _parsed.error.flatten().fieldErrors);
  // Jangan throw di build time agar tidak crash; cukup warn.
}

export const env = _parsed.success
  ? _parsed.data
  : {
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: '',
      NEXT_PUBLIC_MIDTRANS_SNAP_URL: 'https://app.sandbox.midtrans.com/snap/snap.js',
    };
