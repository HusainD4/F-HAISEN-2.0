'use client';
// ============================================================
// src/components/common/error_boundary.tsx
// React Error Boundary — mencegah UI crash & info bug bocor ke user
// ============================================================

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface State {
  hasError: boolean;
  errorId: string;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
  }

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
      errorId: Math.random().toString(36).slice(2, 8).toUpperCase(),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log ke monitoring (jangan console.error di production)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info);
    }
    // Di production: kirim ke Sentry/monitoring service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle size={28} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                Terjadi Kesalahan
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Komponen ini mengalami error. Silakan muat ulang halaman.
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
                Error ID: {this.state.errorId}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, errorId: '' });
                window.location.reload();
              }}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
