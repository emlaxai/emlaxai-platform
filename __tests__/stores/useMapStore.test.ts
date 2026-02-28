import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/stores/useMapStore';

describe('useMapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      mapMode: 'dark',
      selectedIl: null,
      selectedIlce: null,
      selectedIlCenter: null,
      selectedIlZoom: 9,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      showSearchResults: false,
      searchPin: null,
      layers: {
        talepYogunlugu: false,
        imarBaskisi: false,
        ilSinirlari: true,
        ilceSinirlari: false,
        mahalleSinirlari: false,
      },
    });
  });

  it('varsayılan harita modu dark', () => {
    expect(useMapStore.getState().mapMode).toBe('dark');
  });

  it('il seçimi günceller', () => {
    useMapStore.getState().setSelectedIl('İstanbul');
    expect(useMapStore.getState().selectedIl).toBe('İstanbul');
  });

  it('ilçe seçimi günceller', () => {
    useMapStore.getState().setSelectedIlce('Kadıköy');
    expect(useMapStore.getState().selectedIlce).toBe('Kadıköy');
  });

  it('layer toggle çalışır', () => {
    useMapStore.getState().setLayer('imarBaskisi', true);
    expect(useMapStore.getState().layers.imarBaskisi).toBe(true);

    useMapStore.getState().setLayer('ilSinirlari', false);
    expect(useMapStore.getState().layers.ilSinirlari).toBe(false);
  });

  it('resetSelection tüm seçimi sıfırlar', () => {
    const store = useMapStore.getState();
    store.setSelectedIl('Ankara');
    store.setSelectedIlce('Çankaya');
    store.setSelectedIlCenter([39.93, 32.85]);
    store.setSelectedIlZoom(12);

    useMapStore.getState().resetSelection();

    const state = useMapStore.getState();
    expect(state.selectedIl).toBeNull();
    expect(state.selectedIlce).toBeNull();
    expect(state.selectedIlCenter).toBeNull();
    expect(state.selectedIlZoom).toBe(9);
  });

  it('arama state güncellenir', () => {
    const store = useMapStore.getState();
    store.setSearchQuery('Beşiktaş');
    store.setSearchLoading(true);
    store.setShowSearchResults(true);

    const state = useMapStore.getState();
    expect(state.searchQuery).toBe('Beşiktaş');
    expect(state.searchLoading).toBe(true);
    expect(state.showSearchResults).toBe(true);
  });

  it('searchPin koordinat alır', () => {
    useMapStore.getState().setSearchPin([41.04, 29.0]);
    expect(useMapStore.getState().searchPin).toEqual([41.04, 29.0]);
  });
});
