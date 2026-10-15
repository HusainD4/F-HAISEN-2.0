'use client';
// ============================================================
// src/components/ui/input.tsx
// Input field dengan auto-sanitasi, label, error message
// ============================================================

import React, { forwardRef } from 'react';
import { sanitizeText } from '@/security/sanitizer';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  sanitize?: boolean; // auto sanitize on change
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, sanitize = true, onChange, className = '', id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (sanitize && e.target.type === 'text') {
      e.target.value = sanitizeText(e.target.value);
    }
    onChange?.(e);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text)]"
        >
          {label}
          {props.required && <span className="text-gold ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={[
            'w-full bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)]',
            'border rounded-xl px-4 py-2.5 text-sm outline-none',
            'transition-all duration-200',
            'focus:ring-2 focus:ring-gold/40 focus:border-gold',
            error
              ? 'border-red-500 focus:ring-red-400/40'
              : 'border-[var(--border)] hover:border-gold/50',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-[var(--text-muted)]">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

// ── Textarea Variant ─────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className = '', id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
          {label}
          {props.required && <span className="text-gold ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={4}
        className={[
          'w-full bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)]',
          'border rounded-xl px-4 py-2.5 text-sm outline-none resize-none',
          'transition-all duration-200',
          'focus:ring-2 focus:ring-gold/40 focus:border-gold',
          error
            ? 'border-red-500 focus:ring-red-400/40'
            : 'border-[var(--border)] hover:border-gold/50',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500 animate-fade-in">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
});
