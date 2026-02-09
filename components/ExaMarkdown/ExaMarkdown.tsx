'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// ========================================================================
// Chart JSON parser — ```chart bloklarını ECharts grafiğine çevirir
// ========================================================================

interface ChartData {
  type?: 'line' | 'bar';
  title?: string;
  xAxis: string[];
  series: { name: string; data: number[] }[];
}

function ExaChart({ json, compact }: { json: string; compact?: boolean }) {
  const chartData = useMemo<ChartData | null>(() => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.xAxis && parsed.series) return parsed;
      return null;
    } catch {
      return null;
    }
  }, [json]);

  if (!chartData) return <code>{json}</code>;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const option = {
    backgroundColor: 'transparent',
    title: chartData.title
      ? {
          text: chartData.title,
          left: 'center',
          top: 0,
          textStyle: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: compact ? 11 : 13,
            fontWeight: 600,
          },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          const value = typeof p.value === 'number'
            ? p.value.toLocaleString('tr-TR') + ' TL'
            : p.value;
          result += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block"></span>
            <span>${p.seriesName}: <b>${value}</b></span>
          </div>`;
        });
        return result;
      },
    },
    legend:
      chartData.series.length > 1
        ? {
            bottom: 0,
            textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
            itemWidth: 12,
            itemHeight: 8,
          }
        : undefined,
    grid: {
      top: chartData.title ? (compact ? 30 : 40) : 10,
      left: 10,
      right: 15,
      bottom: chartData.series.length > 1 ? 30 : 10,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.xAxis,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: compact ? 9 : 10,
        rotate: chartData.xAxis.length > 12 ? 45 : 0,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: compact ? 9 : 10,
        formatter: (val: number) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
          if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
          return val.toString();
        },
      },
    },
    series: chartData.series.map((s, i) => ({
      name: s.name,
      type: chartData.type || 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: compact ? 3 : 4,
      lineStyle: { width: 2, color: colors[i % colors.length] },
      itemStyle: { color: colors[i % colors.length] },
      areaStyle:
        chartData.type !== 'bar'
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colors[i % colors.length] + '30' },
                  { offset: 1, color: colors[i % colors.length] + '05' },
                ],
              },
            }
          : undefined,
    })),
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
  };

  return (
    <div
      className="my-3 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <ReactECharts
        option={option}
        style={{ height: compact ? '200px' : '280px', width: '100%' }}
        opts={{ renderer: 'svg' }}
        theme="dark"
      />
    </div>
  );
}

// ========================================================================
// ExaMarkdown — ReactMarkdown + chart code block desteği
// ========================================================================

interface ExaMarkdownProps {
  children: string;
  compact?: boolean; // Parselens hızlı analiz için küçük boyut
}

export default function ExaMarkdown({ children, compact }: ExaMarkdownProps) {
  // Özel components: code bloklarını kontrol et
  const components = useMemo(
    () => ({
      code({ className, children: codeChildren, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        const lang = match ? match[1] : '';

        // ```chart bloğu → ECharts grafiği render et
        if (lang === 'chart') {
          const json = String(codeChildren).replace(/\n$/, '');
          return <ExaChart json={json} compact={compact} />;
        }

        // Diğer code blokları normal göster
        if (lang) {
          return (
            <pre
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '12px',
                overflowX: 'hidden',
                maxWidth: '100%',
                margin: '8px 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              <code className={className} {...props}>
                {codeChildren}
              </code>
            </pre>
          );
        }

        // Inline code
        return (
          <code className={className} {...props}>
            {codeChildren}
          </code>
        );
      },
      // Tabloyu da güzel göster (eğer GPT yine de tablo üretirse)
      table({ children: tableChildren }: any) {
        return (
          <div className="my-2 overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: compact ? '11px' : '12px',
              }}
            >
              {tableChildren}
            </table>
          </div>
        );
      },
      thead({ children: theadChildren }: any) {
        return (
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            {theadChildren}
          </thead>
        );
      },
      th({ children: thChildren }: any) {
        return (
          <th
            style={{
              padding: '6px 10px',
              textAlign: 'left',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {thChildren}
          </th>
        );
      },
      td({ children: tdChildren }: any) {
        return (
          <td
            style={{
              padding: '5px 10px',
              color: 'rgba(255,255,255,0.6)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {tdChildren}
          </td>
        );
      },
    }),
    [compact]
  );

  return (
    <div className="exa-markdown" style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
