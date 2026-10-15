'use client';
// ============================================================
// src/components/ui/toast.tsx
// Toast notification — pojok kanan atas, slide in dari kanan
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  removing?: boolean;
}

// ── Global Toast State ───────────────────────────────────────
let _toasts: ToastItem[] = [];
let _setToastsExternal: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const toast = {
  success: (title: string, message?: string, duration = 4000) =>
    addToast({ type: 'success', title, message, duration }),
  error:   (title: string, message?: string, duration = 5000) =>
    addToast({ type: 'error', title, message, duration }),
  warning: (title: string, message?: string, duration = 4500) =>
    addToast({ type: 'warning', title, message, duration }),
  info:    (title: string, message?: string, duration = 4000) =>
    addToast({ type: 'info', title, message, duration }),
};

function addToast(item: Omit<ToastItem, 'id'>) {
  const id = generateId();
  _toasts = [{ ...item, id }, ..._toasts].slice(0, 5); // max 5
  _setToastsExternal?.([..._toasts]);
  return id;
}

// ── Individual Toast ─────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-green-400 shrink-0" />,
  error:   <XCircle    size={18} className="text-red-400 shrink-0" />,
  warning: <AlertCircle size={18} className="text-yellow-400 shrink-0" />,
  info:    <Info        size={18} className="text-blue-400 shrink-0" />,
};

const BAR_COLORS: Record<ToastType, string> = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  warning: 'bg-yellow-400',
  info:    'bg-blue-400',
};

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const remove = useCallback(() => {
    setVisible(false);
    timerRef.current = setTimeout(() => onRemove(item.id), 300);
  }, [item.id, onRemove]);

  useEffect(() => {
    timerRef.current = setTimeout(remove, item.duration ?? 4000);
    return () => clearTimeout(timerRef.current);
  }, [item.duration, remove]);

  return (
    <div
      className={[
        'relative overflow-hidden card flex items-start gap-3 p-4 w-80 max-w-[calc(100vw-2rem)]',
        'transition-all duration-300',
        visible ? 'animate-slide-in-right opacity-100' : 'animate-slide-out-right opacity-0',
      ].join(' ')}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${BAR_COLORS[item.type]} transition-all`}
        style={{
          animation: `progressBar ${item.duration ?? 4000}ms linear forwards`,
        }}
      />

      {ICONS[item.type]}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] leading-tight">{item.title}</p>
        {item.message && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{item.message}</p>
        )}
      </div>

      <button
        onClick={remove}
        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0 -mt-0.5"
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ── Toast Container (mount once in layout) ───────────────────

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _setToastsExternal = setToasts;
    return () => { _setToastsExternal = null; };
  }, []);

  const removeToast = useCallback((id: string) => {
    _toasts = _toasts.filter((t) => t.id !== id);
    setToasts([..._toasts]);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
