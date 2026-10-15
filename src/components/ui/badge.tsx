'use client';
// ============================================================
// src/components/ui/badge.tsx
// Badge untuk status order, label produk (BARU / PROMO / DIGITAL)
// ============================================================

import React from 'react';

type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'teal' | 'indigo' | 'orange' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  gold:   'bg-gold/15 text-gold border-gold/30',
  green:  'bg-green-500/15 text-green-400 border-green-500/30',
  red:    'bg-red-500/15 text-red-400 border-red-500/30',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  teal:   'bg-teal-500/15 text-teal-400 border-teal-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  gray:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export function Badge({ variant = 'gray', children, size = 'sm', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 border font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        VARIANT_STYLES[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Badge khusus label produk */
export function ProductBadge({ type }: { type: 'new' | 'promo' | 'digital' | 'service' | 'physical' }) {
  const MAP = {
    new:      { label: 'BARU',    variant: 'gold'   as BadgeVariant },
    promo:    { label: 'PROMO',   variant: 'red'    as BadgeVariant },
    digital:  { label: 'DIGITAL', variant: 'blue'   as BadgeVariant },
    service:  { label: 'JASA',    variant: 'purple' as BadgeVariant },
    physical: { label: 'FISIK',   variant: 'teal'   as BadgeVariant },
  };
  const { label, variant } = MAP[type];
  return <Badge variant={variant} size="sm">{label}</Badge>;
}
