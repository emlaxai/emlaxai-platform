import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      splitPosition: 50,
      isResizing: false,
      isFilterOpen: false,
      isLayersDropdownOpen: false,
      isDrawerOpen: false,
      isMobileSidebarOpen: false,
      isExaChatOpen: false,
      chatPanelHeight: 55,
    });
  });

  it('varsayılan değerlerle başlar', () => {
    const state = useUIStore.getState();
    expect(state.splitPosition).toBe(50);
    expect(state.isResizing).toBe(false);
    expect(state.isExaChatOpen).toBe(false);
    expect(state.chatPanelHeight).toBe(55);
  });

  it('splitPosition günceller', () => {
    useUIStore.getState().setSplitPosition(75);
    expect(useUIStore.getState().splitPosition).toBe(75);
  });

  it('isResizing günceller', () => {
    useUIStore.getState().setIsResizing(true);
    expect(useUIStore.getState().isResizing).toBe(true);
  });

  it('isExaChatOpen toggle eder', () => {
    useUIStore.getState().setIsExaChatOpen(true);
    expect(useUIStore.getState().isExaChatOpen).toBe(true);
    useUIStore.getState().setIsExaChatOpen(false);
    expect(useUIStore.getState().isExaChatOpen).toBe(false);
  });

  it('chatPanelHeight günceller', () => {
    useUIStore.getState().setChatPanelHeight(80);
    expect(useUIStore.getState().chatPanelHeight).toBe(80);
  });

  it('birden fazla state aynı anda güncellenir', () => {
    const store = useUIStore.getState();
    store.setIsFilterOpen(true);
    store.setIsDrawerOpen(true);
    store.setSplitPosition(30);

    const state = useUIStore.getState();
    expect(state.isFilterOpen).toBe(true);
    expect(state.isDrawerOpen).toBe(true);
    expect(state.splitPosition).toBe(30);
  });
});
