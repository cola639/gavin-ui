// src/components/StatusPill.tsx
import clsx from 'classnames';
import React from 'react';

type Tone = 'success' | 'danger' | 'warning';

type Props = {
  label: string;
  tone?: Tone;
  className?: string;
};

const toneStyles: Record<Tone, React.CSSProperties> = {
  success: {
    background: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.28)',
    color: '#059669'
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.26)',
    color: '#ef4444'
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.14)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    color: '#b45309'
  }
};

const baseClasses = 'inline-flex items-center justify-center h-6 px-3 rounded-full text-[12px] font-bold border';

export default function StatusPill({ label, tone = 'success', className }: Props) {
  return (
    <span className={clsx(baseClasses, className)} style={toneStyles[tone]}>
      {label}
    </span>
  );
}
