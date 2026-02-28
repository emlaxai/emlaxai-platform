import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalysisStore } from '@/stores/useAnalysisStore';

describe('useAnalysisStore', () => {
  beforeEach(() => {
    useAnalysisStore.setState({
      activeTab: 'genel',
      trendKategori: 'konut',
      propertyType: 'Konut',
      selectedMetric: 'm2',
      analysisTitle: 'Türkiye Genel Bakış',
      selectedParcel: null,
      parcelLoading: false,
      disasterRisk: null,
      showAll81Cities: false,
    });
  });

  it('varsayılan tab genel', () => {
    expect(useAnalysisStore.getState().activeTab).toBe('genel');
  });

  it('tab değiştirir', () => {
    useAnalysisStore.getState().setActiveTab('risk');
    expect(useAnalysisStore.getState().activeTab).toBe('risk');
  });

  it('trend kategorisi günceller', () => {
    useAnalysisStore.getState().setTrendKategori('arsa');
    expect(useAnalysisStore.getState().trendKategori).toBe('arsa');
  });

  it('analiz başlığı günceller', () => {
    useAnalysisStore.getState().setAnalysisTitle('İstanbul Analizi');
    expect(useAnalysisStore.getState().analysisTitle).toBe('İstanbul Analizi');
  });

  it('parcel loading state yönetimi', () => {
    useAnalysisStore.getState().setParcelLoading(true);
    expect(useAnalysisStore.getState().parcelLoading).toBe(true);

    useAnalysisStore.getState().setParcelLoading(false);
    expect(useAnalysisStore.getState().parcelLoading).toBe(false);
  });

  it('81 il görünümü toggle', () => {
    useAnalysisStore.getState().setShowAll81Cities(true);
    expect(useAnalysisStore.getState().showAll81Cities).toBe(true);
  });

  it('selectedMetric günceller', () => {
    useAnalysisStore.getState().setSelectedMetric('toplam');
    expect(useAnalysisStore.getState().selectedMetric).toBe('toplam');
  });
});
