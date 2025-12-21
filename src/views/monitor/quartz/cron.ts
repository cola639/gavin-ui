// src/views/monitor/quartz/cron.ts

export type QuartzCronMode = 'everyMinutes' | 'daily' | 'weekly' | 'monthly' | 'custom';

export const WEEKDAY_OPTIONS = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' }
] as const;

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const buildEveryNMinutes = (n: number) => {
  const step = Math.max(1, Math.min(59, Math.floor(n)));
  // every N minutes: sec=0, min=0/N, hour=*, dom=*, mon=*, dow=?
  return `0 0/${step} * * * ?`;
};

export const buildDailyAt = (hour: number, minute: number) => {
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  const m = Math.max(0, Math.min(59, Math.floor(minute)));
  return `0 ${m} ${h} * * ?`;
};

export const buildWeeklyAt = (days: string[], hour: number, minute: number) => {
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  const m = Math.max(0, Math.min(59, Math.floor(minute)));
  const dow = (days?.length ? days : ['MON']).join(',');
  // weekly: dom=?, mon=*, dow=MON,WED,...
  return `0 ${m} ${h} ? * ${dow}`;
};

export const buildMonthlyAt = (dayOfMonth: number, hour: number, minute: number) => {
  const d = Math.max(1, Math.min(31, Math.floor(dayOfMonth)));
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  const m = Math.max(0, Math.min(59, Math.floor(minute)));
  // monthly: dom=D, mon=*, dow=?
  return `0 ${m} ${h} ${d} * ?`;
};

const splitCron = (cron: string) => cron.trim().split(/\s+/).filter(Boolean);

/**
 * Very small "good enough" Quartz cron description for your UI.
 * Supports: every N minutes, daily, weekly, monthly, and a fallback.
 */
export const describeQuartzCron = (cron?: string) => {
  if (!cron?.trim()) return '—';

  const parts = splitCron(cron);
  // Quartz is usually 6 fields (sec min hour dom mon dow) [+ year optional]
  if (parts.length < 6) return 'Custom schedule';

  const [sec, min, hour, dom, mon, dow] = parts;

  // every N minutes: 0 0/N * * * ?
  const everyMinMatch = min.match(/^0\/(\d+)$/);
  if (sec === '0' && everyMinMatch && hour === '*' && dom === '*' && mon === '*' && dow === '?') {
    return `Every ${everyMinMatch[1]} minute(s)`;
  }

  // daily: 0 m H * * ?
  if (sec === '0' && /^\d+$/.test(min) && /^\d+$/.test(hour) && dom === '*' && mon === '*' && dow === '?') {
    return `Every day at ${pad2(Number(hour))}:${pad2(Number(min))}`;
  }

  // weekly: 0 m H ? * MON,TUE
  if (sec === '0' && /^\d+$/.test(min) && /^\d+$/.test(hour) && dom === '?' && mon === '*' && dow && dow !== '?') {
    const days = dow
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    return `Every week on ${days.join(', ')} at ${pad2(Number(hour))}:${pad2(Number(min))}`;
  }

  // monthly: 0 m H D * ?
  if (sec === '0' && /^\d+$/.test(min) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && mon === '*' && dow === '?') {
    return `Every month on day ${dom} at ${pad2(Number(hour))}:${pad2(Number(min))}`;
  }

  return 'Custom schedule';
};

export const HOUR_OPTIONS = Array.from({ length: 24 }).map((_, i) => ({ label: pad2(i), value: String(i) }));
export const MINUTE_OPTIONS = Array.from({ length: 60 }).map((_, i) => ({ label: pad2(i), value: String(i) }));
