// src/views/dashboard/SalesComparisonChart.tsx
import * as echarts from 'echarts';
import { useEffect, useMemo, useRef } from 'react';
import type { ComparisonSeries } from './types';

type Props = {
  categories: string[];
  series: ComparisonSeries[];
  height?: number;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function SalesComparisonChart({ categories, series, height = 220 }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  const option = useMemo(() => {
    const info = cssVar('--info', '#3b82f6');
    const primary = cssVar('--primary-strong', '#86d6cf');
    const border = cssVar('--border', '#e9eef2');
    const textMuted = cssVar('--text-muted', '#6b7280');
    const textBold = cssVar('--text-bold', '#111827');
    const palette = [info, primary, '#22c55e'];

    return {
      animation: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: '#fff',
        borderColor: border,
        borderWidth: 1,
        padding: [8, 10],
        textStyle: { color: textBold },
        extraCssText: 'box-shadow: var(--shadow-sm); border-radius: 8px;'
      },
      legend: {
        top: 4,
        right: 0,
        textStyle: { color: textMuted, fontSize: 12 },
        icon: 'circle'
      },
      grid: { left: 52, right: 12, top: 32, bottom: 40 },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textMuted, fontSize: 12, margin: 14 }
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textMuted, fontSize: 12 },
        splitLine: { lineStyle: { color: border } }
      },
      series: series.map((s, idx) => {
        const color = s.color || palette[idx % palette.length];
        return {
          type: 'line',
          name: s.name,
          data: s.data,
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color },
          itemStyle: { color }
        };
      })
    };
  }, [categories, series]);

  // init
  useEffect(() => {
    if (!elRef.current) return;

    const chart = echarts.init(elRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // update
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!series || series.length === 0) {
      chart.clear();
      chart.setOption({
        title: {
          text: 'No data',
          left: 'center',
          top: 'middle',
          textStyle: { color: cssVar('--text-muted', '#6b7280'), fontSize: 14, fontWeight: 500 }
        }
      });
      return;
    }

    chart.setOption(option as any, { notMerge: true, lazyUpdate: true });
  }, [option, series]);

  return <div ref={elRef} style={{ width: '100%', height }} />;
}
