// @ts-nocheck
'use client';

interface ChartOptionParams {
  selectedIlce: string | null;
  ilceTrend: any;
  selectedIl: string | null;
  ilTrend: any;
  turkiyeTrend: any;
  selectedMetric: string;
  chartData: any[];
  parselTrend?: any;
}

function buildParselChart(parselTrend: any) {
  const trend = parselTrend.trend;
  if (!trend?.length) return null;

  const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const aylar = trend.map((item: any) => {
    if (item.tarih) {
      const [yil, ay] = item.tarih.split('-');
      return `${ayIsimleri[parseInt(ay) - 1]} ${yil.toString().slice(-2)}`;
    }
    return `${ayIsimleri[(item.ay || 1) - 1]} ${(item.yil || 2025).toString().slice(-2)}`;
  });

  const isGercek = (item: any) => item.veri_tipi === 'gercek' || item.veri_tipi === 'interpolasyon';
  const getPrice = (item: any) => item.parsel_m2 ?? item.m2_fiyat ?? 0;

  const gercekValues = trend.map((item: any) =>
    isGercek(item) ? getPrice(item) : null
  );
  const lastGercekIdx = trend.findLastIndex((item: any) => isGercek(item));
  const tahminValues = trend.map((item: any, idx: number) => {
    if (idx === lastGercekIdx) return getPrice(item);
    if (item.veri_tipi === 'tahmin') return getPrice(item);
    return null;
  });

  return {
    backgroundColor: 'transparent',
    animationDuration: 1200,
    animationEasing: 'cubicInOut',
    grid: { left: '3%', right: '3%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: aylar,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10, interval: Math.floor(aylar.length / 8) }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
      }
    },
    series: [
      {
        name: 'Parsel Gerçek',
        data: gercekValues,
        type: 'line',
        smooth: true,
        showSymbol: false,
        connectNulls: false,
        lineStyle: {
          width: 3,
          color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#06b6d4' }] }
        },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.3)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }] }
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      },
      {
        name: 'Parsel Tahmin',
        data: tahminValues,
        type: 'line',
        smooth: true,
        showSymbol: false,
        connectNulls: false,
        lineStyle: { width: 2, type: 'dashed', color: '#34d399' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(52, 211, 153, 0.15)' }, { offset: 1, color: 'rgba(52, 211, 153, 0.0)' }] }
        },
        animationDuration: 1500,
        animationDelay: 300,
        animationEasing: 'cubicOut'
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => {
        const items = params.filter((p: any) => p.value != null);
        if (items.length === 0) return '';
        const item = items[0];
        const tip = item.seriesName.includes('Tahmin') ? ' (ML Tahmin)' : '';
        return `<b>${item.axisValue}</b><br/><span style="color:#10b981">●</span> ${item.value.toLocaleString('tr-TR')} ₺/m²${tip}`;
      }
    }
  };
}

export function getChartOption(params: ChartOptionParams) {
  const { selectedIlce, ilceTrend, selectedIl, ilTrend, turkiyeTrend, selectedMetric, chartData, parselTrend } = params;

  // Parsel trendi varsa öncelikli olarak onu kullan
  if (parselTrend?.trend?.length > 0) {
    const parselChart = buildParselChart(parselTrend);
    if (parselChart) return parselChart;
  }

  // İlçe seçiliyse ilçe trendini, il seçiliyse il trendini, yoksa Türkiye trendini kullan
  const activeTrend = selectedIlce && ilceTrend ? ilceTrend.trend : selectedIl && ilTrend ? ilTrend.trend : turkiyeTrend?.trend;
  
  if (activeTrend && activeTrend.length > 0) {
    const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    const aylar = activeTrend.map((item) => {
      const [yil, ay] = item.tarih.split('-');
      return `${ayIsimleri[parseInt(ay) - 1]} ${yil.slice(2)}`;
    });
    
    // Gerçek veri serisi (interpolasyon da gerçek sayılır)
    const isGercekVeri = (t: string) => t === 'gercek' || t === 'interpolasyon';
    const gercekValues = activeTrend.map((item) => 
      isGercekVeri(item.veri_tipi) ? item.m2_fiyat : null
    );
    
    // Tahmin veri serisi (gerçeğin son noktasından devam etsin)
    const lastGercekIdx = activeTrend.findLastIndex((item) => isGercekVeri(item.veri_tipi));
    const tahminValues = activeTrend.map((item, idx) => {
      if (idx === lastGercekIdx) return item.m2_fiyat;
      if (item.veri_tipi === 'tahmin') return item.m2_fiyat;
      return null;
    });
    
    return {
      backgroundColor: 'transparent',
      animationDuration: 1200,
      animationEasing: 'cubicInOut',
      grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: aylar,
        axisLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10,
          interval: Math.floor(aylar.length / 8)
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
          formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
        }
      },
      series: [
        {
          name: 'Gerçek',
          data: gercekValues,
          type: 'line',
          smooth: true,
          showSymbol: false,
          connectNulls: false,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#8b5cf6' }
              ]
            }
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
              ]
            }
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut'
        },
        {
          name: 'Tahmin',
          data: tahminValues,
          type: 'line',
          smooth: true,
          showSymbol: false,
          connectNulls: false,
          animationDuration: 1500,
          animationDelay: 300,
          animationEasing: 'cubicOut',
          lineStyle: {
            width: 2,
            type: 'dashed',
            color: '#a78bfa'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(167, 139, 250, 0.15)' },
                { offset: 1, color: 'rgba(167, 139, 250, 0.0)' }
              ]
            }
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          const items = params.filter((p: any) => p.value != null);
          if (items.length === 0) return '';
          const item = items[0];
          const value = item.value;
          const tip = item.seriesName === 'Tahmin' ? ' (ML Tahmin)' : '';
          return `<b>${item.axisValue}</b><br/>${value.toLocaleString('tr-TR')} ₺/m²${tip}`;
        }
      }
    };
  }
  
  // Fallback: Mock data (yükleme sırasında)
  const dataKey = selectedMetric === 'm2' ? 'm2' : selectedMetric === 'satis' ? 'satis' : 'kira';
  const values = chartData.map(d => d[dataKey]);
  
  return {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.ay),
      axisLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        formatter: (value: number) => {
          if (selectedMetric === 'kira') return `%${value.toFixed(1)}`;
          if (selectedMetric === 'm2') return `${(value / 1000).toFixed(0)}K`;
          return `${value.toFixed(1)}M`;
        }
      }
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
            ]
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => {
        const value = params[0].value;
        let formattedValue = '';
        if (selectedMetric === 'kira') formattedValue = `%${value.toFixed(1)}`;
        else if (selectedMetric === 'm2') formattedValue = `${value.toLocaleString('tr-TR')} ₺/m²`;
        else formattedValue = `${value.toFixed(2)}M ₺`;
        return `${params[0].axisValue}<br/>${formattedValue}`;
      }
    }
  };
}
