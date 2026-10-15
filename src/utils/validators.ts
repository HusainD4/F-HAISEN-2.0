// ============================================================
// src/utils/validators.ts
// Zod Schemas untuk semua form di frontend
// Validasi dilakukan di sisi client sebelum dikirim ke backend.
// ============================================================

import { z } from 'zod';

// ── Reusable Field Rules ─────────────────────────────────────

const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
const postalCodeRegex = /^[0-9]{5}$/;
const passwordRules = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Harus mengandung huruf kapital')
  .regex(/[0-9]/, 'Harus mengandung angka');

// ── Address Fields (reusable) ────────────────────────────────

const addressFields = {
  address: z.string().min(10, 'Alamat minimal 10 karakter').max(500),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  city: z.string().min(2, 'Kabupaten/Kota wajib diisi'),
  district: z.string().min(2, 'Kecamatan wajib diisi'),
  postal_code: z
    .string()
    .regex(postalCodeRegex, 'Kode pos harus 5 digit angka'),
};

// ── Auth Forms ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
    email: z.string().email('Format email tidak valid'),
    password: passwordRules,
    confirm_password: z.string(),
    phone: z
      .string()
      .regex(phoneRegex, 'Format nomor HP tidak valid (contoh: 08123456789)')
      .optional()
      .or(z.literal('')),
    // Alamat opsional saat register
    address: z.string().max(500).optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    district: z.string().optional().or(z.literal('')),
    postal_code: z
      .string()
      .regex(postalCodeRegex, 'Kode pos harus 5 digit')
      .optional()
      .or(z.literal('')),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirm_password'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    new_password: passwordRules,
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ── Profile Forms ────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z.string().min(3, 'Minimal 3 karakter').max(100),
  phone: z
    .string()
    .regex(phoneRegex, 'Format nomor HP tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  postal_code: z
    .string()
    .regex(postalCodeRegex, 'Kode pos harus 5 digit')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Password lama wajib diisi'),
    new_password: passwordRules,
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Password baru tidak cocok',
    path: ['confirm_password'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ── Checkout Forms ───────────────────────────────────────────

/**
 * Checkout untuk produk FISIK — semua data pengiriman WAJIB diisi.
 */
export const checkoutPhysicalSchema = z.object({
  ...addressFields,
  courier: z.string().min(1, 'Pilih kurir pengiriman'),
  courier_service: z.string().min(1, 'Pilih layanan pengiriman'),
  order_note: z.string().max(500).optional().or(z.literal('')),
});

export type CheckoutPhysicalFormData = z.infer<typeof checkoutPhysicalSchema>;

/**
 * Checkout untuk produk DIGITAL / JASA — hanya catatan pembeli (opsional).
 */
export const checkoutDigitalSchema = z.object({
  order_note: z.string().max(500).optional().or(z.literal('')),
});

export type CheckoutDigitalFormData = z.infer<typeof checkoutDigitalSchema>;
