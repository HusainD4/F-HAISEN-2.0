'use client';
// ============================================================
// src/components/ui/button.tsx
// Button dengan variants premium + loading + scale animation
// ============================================================

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, string> = {
  gold:      'bg-gold text-charcoal-900 hover:bg-gold-400 shadow-gold hover:shadow-gold-lg font-semibold',
  primary:   'bg-charcoal-800 text-white hover:bg-charcoal-700 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 border border-transparent',
  secondary: 'bg-transparent border border-[var(--border)] text-[var(--text)] hover:border-gold hover:text-gold',
  ghost:     'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)]',
  danger:    'bg-red-600 text-white hover:bg-red-500 shadow-sm',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'hover:scale-[1.02]',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
