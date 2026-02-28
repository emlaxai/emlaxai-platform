'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/useUIStore';

const MIN_SPLIT = 25;
const MAX_SPLIT = 75;

export function useSplitPanel() {
  const { splitPosition, setSplitPosition, isResizing, setIsResizing } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
    },
    [setIsResizing]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(MIN_SPLIT, Math.min(MAX_SPLIT, pct)));
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSplitPosition, setIsResizing]);

  return {
    splitPosition,
    isResizing,
    containerRef,
    handleMouseDown,
  };
}
