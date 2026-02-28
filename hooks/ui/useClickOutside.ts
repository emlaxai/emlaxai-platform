'use client';

import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const refArray = Array.isArray(refs) ? refs : [refs];

    const handleClick = (e: MouseEvent) => {
      const clickedInside = refArray.some(
        (ref) => ref.current && ref.current.contains(e.target as Node)
      );
      if (!clickedInside) handler();
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [refs, handler, enabled]);
}
