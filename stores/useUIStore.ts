'use client';

import { create } from 'zustand';

interface UIState {
  splitPosition: number;
  isResizing: boolean;
  isFilterOpen: boolean;
  isLayersDropdownOpen: boolean;
  isDrawerOpen: boolean;
  isMobileSidebarOpen: boolean;
  isExaChatOpen: boolean;
  chatPanelHeight: number;

  setSplitPosition: (pos: number) => void;
  setIsResizing: (resizing: boolean) => void;
  setIsFilterOpen: (open: boolean) => void;
  setIsLayersDropdownOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  setIsExaChatOpen: (open: boolean) => void;
  setChatPanelHeight: (height: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  splitPosition: 50,
  isResizing: false,
  isFilterOpen: false,
  isLayersDropdownOpen: false,
  isDrawerOpen: false,
  isMobileSidebarOpen: false,
  isExaChatOpen: false,
  chatPanelHeight: 55,

  setSplitPosition: (pos) => set({ splitPosition: pos }),
  setIsResizing: (resizing) => set({ isResizing: resizing }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  setIsLayersDropdownOpen: (open) => set({ isLayersDropdownOpen: open }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setIsMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  setIsExaChatOpen: (open) => set({ isExaChatOpen: open }),
  setChatPanelHeight: (height) => set({ chatPanelHeight: height }),
}));
