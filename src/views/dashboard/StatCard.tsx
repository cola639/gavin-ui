// src/views/dashboard/components/StatCard.tsx
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StatCard } from './types';

type Props = {
  item: StatCard;
  icon: ReactNode;
  iconVariant: 'info' | 'warning' | 'success' | 'danger';
};

const variantClass: Record<Props['iconVariant'], string> = {
  info: 'bg-[var(--info-bg)] text-[var(--info)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  success: 'bg-[var(--success-bg)] text-[var(--success)]',
  danger: 'bg-[var(--danger-bg)] text-[var(--danger)]'
};

function formatValue(value: number, fmt: StatCard['valueFormat']) {
  if (fmt === 'currency') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat(undefined).format(value);
}

export default function StatCard({ item, icon, iconVariant }: Props) {
  const isUp = item.trend.direction === 'up';

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[var(--text-muted)] text-sm font-medium">{item.title}</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-bold)]">{formatValue(item.value, item.valueFormat)}</div>
        </div>

        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${variantClass[iconVariant]}`}>{icon}</div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className={`inline-flex items-center gap-1 font-semibold ${isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
          {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {item.trend.percent.toFixed(1)}%
        </span>
        <span className="text-[var(--text-muted)]">{item.trend.label}</span>
      </div>
    </div>
  );
}
