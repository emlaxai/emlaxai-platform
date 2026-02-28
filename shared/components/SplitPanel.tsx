'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface SplitPanelProps {
  left: ReactNode;
  right: ReactNode;
  initialPosition?: number;
  minPosition?: number;
  maxPosition?: number;
  snapThreshold?: number;
  className?: string;
  onPositionChange?: (position: number) => void;
}

export function SplitPanel({
  left,
  right,
  initialPosition = 50,
  minPosition = 20,
  maxPosition = 80,
  snapThreshold = 5,
  className = '',
  onPositionChange,
}: SplitPanelProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(
    (newPos: number) => {
      setPosition(newPos);
      onPositionChange?.(newPos);
    },
    [onPositionChange]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;

      let newPos: number;
      if (raw < snapThreshold) newPos = 0;
      else if (raw > 100 - snapThreshold) newPos = 100;
      else newPos = Math.max(minPosition, Math.min(maxPosition, raw));

      updatePosition(newPos);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, minPosition, maxPosition, snapThreshold, updatePosition]);

  const togglePanel = useCallback(() => {
    if (position === 0) updatePosition(50);
    else if (position === 100) updatePosition(50);
    else if (position > 50) updatePosition(0);
    else updatePosition(100);
  }, [position, updatePosition]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {/* Left Panel */}
      <div
        className="absolute top-0 left-0 bottom-0 overflow-y-auto transition-[width] duration-200"
        style={{
          width: `${position}%`,
          display: position === 0 ? 'none' : undefined,
        }}
      >
        {left}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 flex items-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/10 cursor-col-resize hover:bg-white/30 transition-colors"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
        <button
          onClick={togglePanel}
          className="relative z-20 w-5 h-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {position === 0 ? (
              <polyline points="3,2 7,5 3,8" />
            ) : position === 100 ? (
              <polyline points="7,2 3,5 7,8" />
            ) : (
              <>
                <line x1="3" y1="2" x2="3" y2="8" />
                <line x1="7" y1="2" x2="7" y2="8" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Right Panel */}
      <div
        className="absolute top-0 right-0 bottom-0 overflow-hidden"
        style={{
          left: `${position}%`,
          display: position === 100 ? 'none' : undefined,
        }}
      >
        {right}
      </div>
    </div>
  );
}
