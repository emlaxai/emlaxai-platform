'use client';

import { forwardRef, type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '' }, ref) => (
    <div
      ref={ref}
      className={`w-full h-full rounded-3xl overflow-hidden relative ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </div>
  )
);

GlassCard.displayName = 'GlassCard';
