// src/views/dashboard/components/SalesAreaChart.tsx
import * as echarts from 'echarts';
import { useEffect, useMemo, useRef } from 'react';
import type { SalesPoint } from './types';

type Props = {
  data: SalesPoint[];
  height?: number;
  formatY?: (v: number) => string;
  tooltipTitle?: string;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function withAlpha(color: string, alpha: number) {
  const c = color.trim();

  if (c.startsWith('#')) {
    const hex = c.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : hex.length === 6
          ? hex
          : hex.slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (c.startsWith('rgba(')) {
    return c.replace(/rgba\(([^)]+)\)/, (_, inside) => {
      const parts = inside.split(',').map((p: string) => p.trim());
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    });
  }

  if (c.startsWith('rgb(')) return c.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  return c;
}

export default function SalesAreaChart({ data, height = 320, formatY = (v) => `${Math.round(v)}%`, tooltipTitle = 'Sales' }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  const option = useMemo(() => {
    // theme from your CSS variables
    const primaryStrong = cssVar('--primary-strong', '#86d6cf');
    const primaryLight = cssVar('--primary-light', '#c1ece8');
    const border = cssVar('--border', '#e9eef2');
    const textMuted = cssVar('--text-muted', '#6b7280');
    const textBold = cssVar('--text-bold', '#111827');

    const xData = data.map((d) => d.x);
    const yData = data.map((d) => d.value);

    return {
      animation: true,
      grid: { left: 56, right: 20, top: 24, bottom: 42 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: '#fff',
        borderColor: border,
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: textBold },
        extraCssText: 'box-shadow: var(--shadow-sm); border-radius: 8px;',
        formatter: (params: any) => {
          const p = params?.[0];
          if (!p) return '';
          const x = p.axisValue;
          const y = p.data;
          return `
            <div style="font-size:12px;color:${textMuted};margin-bottom:4px;">${tooltipTitle} · ${x}</div>
            <div style="font-size:14px;font-weight:600;color:${textBold};">${formatY(y)}</div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textMuted, fontSize: 12, margin: 16 }
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: textMuted,
          fontSize: 12,
          formatter: (v: number) => formatY(v)
        },
        splitLine: { lineStyle: { color: border } }
      },
      series: [
        {
          type: 'line',
          data: yData,
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: primaryStrong },
          itemStyle: { color: primaryStrong },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: withAlpha(primaryLight, 0.85) },
              { offset: 1, color: withAlpha(primaryLight, 0.08) }
            ])
          }
        }
      ]
    };
  }, [data, formatY, tooltipTitle]);

  // init + resize handling
  useEffect(() => {
    if (!elRef.current) return;

    const chart = echarts.init(elRef.current, undefined, {
      // renderer: 'svg', // optional (looks crisp, a bit heavier)
      renderer: 'canvas'
    });
    chartRef.current = chart;

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // set options when data changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!data || data.length === 0) {
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
  }, [option, data]);

  return <div ref={elRef} style={{ width: '100%', height }} />;
}
