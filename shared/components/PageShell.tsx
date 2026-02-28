'use client';

import { type ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

const SIDEBAR_OPEN_WIDTH = 280;
const SIDEBAR_CLOSED_WIDTH = 80;
const SIDEBAR_MARGIN = 30;

export function PageShell({ children, className = '' }: PageShellProps) {
  const { isOpen: sidebarOpen } = useSidebar();
  const sidebarWidth = (sidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH) + SIDEBAR_MARGIN;

  return (
    <div
      className={`fixed top-5 right-5 bottom-5 transition-all duration-300 ${className}`}
      style={{ left: `${sidebarWidth}px` }}
    >
      {children}
    </div>
  );
}
