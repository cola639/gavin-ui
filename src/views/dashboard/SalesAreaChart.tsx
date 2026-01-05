// src/views/dashboard/components/SalesAreaChart.tsx
import { useMemo, useState } from 'react';
import type { SalesPoint } from './types';

type Props = {
  data: SalesPoint[];
  height?: number;
  formatY?: (v: number) => string;
  tooltipTitle?: string;
};

type Pt = { x: number; y: number; raw: SalesPoint };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SalesAreaChart({ data, height = 320, formatY = (v) => `${Math.round(v)}%`, tooltipTitle = 'Sales' }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const padding = { left: 56, right: 20, top: 18, bottom: 42 };

  const { points, min, max, viewW, viewH, lineD, areaD, yTicks } = useMemo(() => {
    const viewW = 980;
    const viewH = height;

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1, max - min);

    const innerW = viewW - padding.left - padding.right;
    const innerH = viewH - padding.top - padding.bottom;

    const pts: Pt[] = data.map((raw, i) => {
      const t = data.length <= 1 ? 0 : i / (data.length - 1);
      const x = padding.left + t * innerW;

      const norm = (raw.value - min) / span; // 0..1
      const y = padding.top + (1 - norm) * innerH;

      return { x, y, raw };
    });

    const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

    const areaD = [
      lineD,
      `L ${pts[pts.length - 1]?.x.toFixed(2)} ${(viewH - padding.bottom).toFixed(2)}`,
      `L ${pts[0]?.x.toFixed(2)} ${(viewH - padding.bottom).toFixed(2)}`,
      'Z'
    ].join(' ');

    // 5 ticks like the screenshot
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const t = i / (tickCount - 1); // 0..1
      const value = max - t * span;
      const y = padding.top + t * innerH;
      return { y, value };
    });

    return { points: pts, min, max, viewW, viewH, lineD, areaD, yTicks };
  }, [data, height]);

  const hover = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      {hover && (
        <div
          className="absolute z-10 rounded-md border border-[var(--border)] bg-white px-3 py-2 shadow-[var(--shadow-sm)] text-sm"
          style={{
            left: clamp(hover.x - 44, 8, 980 - 120),
            top: clamp(hover.y - 56, 8, height - 80)
          }}
        >
          <div className="text-[var(--text-muted)]">{tooltipTitle}</div>
          <div className="font-semibold text-[var(--text-bold)]">{formatY(hover.raw.value)}</div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const svg = e.currentTarget;
          const rect = svg.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * viewW;

          // nearest by x
          let best = 0;
          let bestDist = Number.POSITIVE_INFINITY;
          for (let i = 0; i < points.length; i++) {
            const d = Math.abs(points[i].x - px);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          }
          setHoverIndex(best);
        }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-light)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--primary-light)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line x1={padding.left} x2={viewW - padding.right} y1={t.y} y2={t.y} stroke="var(--border)" strokeWidth="1" />
            <text x={padding.left - 12} y={t.y + 4} textAnchor="end" fontSize="12" fill="var(--text-muted)">
              {formatY(t.value)}
            </text>
          </g>
        ))}

        {/* x labels (few) */}
        {data.map((d, i) => {
          if (data.length > 12 && i % 2 === 1) return null;
          const p = points[i];
          return (
            <text key={d.x} x={p.x} y={viewH - 16} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
              {d.x}
            </text>
          );
        })}

        {/* area */}
        <path d={areaD} fill="url(#areaFill)" />

        {/* line */}
        <path d={lineD} fill="none" stroke="var(--primary-strong)" strokeWidth="2.5" />

        {/* points */}
        {points.map((p, i) => {
          const active = i === hoverIndex;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={active ? 5 : 4} fill="var(--primary-strong)" />
              {active && <circle cx={p.x} cy={p.y} r={9} fill="var(--primary-strong)" opacity="0.12" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
