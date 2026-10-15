'use client';
// ============================================================
// src/components/ui/modal.tsx
// Modal / Dialog premium dengan backdrop blur + scale animation
// ============================================================

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Klik backdrop untuk tutup (default: true) */
  closeOnBackdrop?: boolean;
}

const SIZE_STYLES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  // Tutup dengan Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full card animate-scale-in',
          'max-h-[90vh] overflow-y-auto',
          SIZE_STYLES[size],
        ].join(' ')}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-[var(--border)]">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] rounded-lg p-1.5 transition-all shrink-0"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={title || description ? 'p-6 pt-4' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Footer helper untuk modal actions */
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[var(--border)]">
      {children}
    </div>
  );
}
