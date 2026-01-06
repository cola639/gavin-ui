// src/views/dashboard/CustomerDonutChart.tsx
import * as echarts from 'echarts';
import { useEffect, useMemo, useRef } from 'react';

type Props = {
  newCount: number;
  repeatCount: number;
  height?: number;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function CustomerDonutChart({ newCount, repeatCount, height = 190 }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  const option = useMemo(() => {
    const info = cssVar('--info', '#3b82f6');
    const primaryLight = cssVar('--primary-light', '#c1ece8');
    const border = cssVar('--border', '#e9eef2');
    const textMuted = cssVar('--text-muted', '#6b7280');

    return {
      animation: true,
      tooltip: {
        trigger: 'item',
        borderColor: border,
        borderWidth: 1,
        backgroundColor: '#fff',
        textStyle: { color: cssVar('--text-bold', '#111827') },
        extraCssText: 'box-shadow: var(--shadow-sm); border-radius: 8px;',
        formatter: (p: any) => {
          if (!p) return '';
          return `
            <div style="font-size:12px;color:${textMuted};margin-bottom:4px;">${p.name}</div>
            <div style="font-size:14px;font-weight:600;">${p.value.toLocaleString()}</div>
          `;
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['68%', '82%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 4 },
          data: [
            { value: newCount, name: 'New Customers', itemStyle: { color: info } },
            { value: repeatCount, name: 'Repeated', itemStyle: { color: primaryLight } }
          ]
        }
      ]
    };
  }, [newCount, repeatCount]);

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

    if (!newCount && !repeatCount) {
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
  }, [option, newCount, repeatCount]);

  return <div ref={elRef} style={{ width: '100%', height }} />;
}
