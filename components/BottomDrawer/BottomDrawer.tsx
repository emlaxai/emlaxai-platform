'use client';

import { useState, useEffect } from 'react';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomDrawer({ isOpen, onClose, children }: BottomDrawerProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      // Swipe down
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed left-0 right-0 bottom-0 z-50 md:hidden
          bg-gradient-to-br from-white/[0.12] to-white/[0.08]
          backdrop-blur-xl backdrop-saturate-120
          border-t border-white/[0.15]
          rounded-t-3xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle Bar */}
        <div
          className="flex justify-center pt-3 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: 'calc(85vh - 40px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
