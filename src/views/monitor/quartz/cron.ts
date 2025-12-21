// src/views/monitor/quartz/cron.ts

export type Option = { label: string; value: string };

export type CronMode = 'daily' | 'weekly' | 'monthly' | 'custom';

export const CRON_MODE_OPTIONS: Option[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom', value: 'custom' }
];

export const WEEKDAYS: Array<{ key: string; label: string }> = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' }
];

export const pad2 = (n: string | number) => String(n).padStart(2, '0');

export const buildHourOptions = (): Option[] => Array.from({ length: 24 }).map((_, i) => ({ label: pad2(i), value: String(i) }));

export const buildMinuteOptions = (): Option[] => Array.from({ length: 60 }).map((_, i) => ({ label: pad2(i), value: String(i) }));

export const buildMonthDayOptions = (): Option[] =>
  Array.from({ length: 31 }).map((_, i) => {
    const d = i + 1;
    return { label: String(d), value: String(d) };
  });

export type DetectCronResult = {
  mode: CronMode;
  hh?: string;
  mm?: string;
  dom?: string;
  dows?: string[];
};

/**
 * Recognizes 3 patterns used by our builder:
 * - daily:   0 mm HH * * ?
 * - weekly:  0 mm HH ? * MON,TUE
 * - monthly: 0 mm HH DD * ?
 */
export const detectCronMode = (cron?: string): DetectCronResult => {
  const s = (cron ?? '').trim();

  // daily
  let m = s.match(/^0\s+(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\?$/);
  if (m) return { mode: 'daily', mm: m[1], hh: m[2] };

  // weekly
  m = s.match(/^0\s+(\d{1,2})\s+(\d{1,2})\s+\?\s+\*\s+([A-Z]{3}(?:,[A-Z]{3})*)$/);
  if (m) return { mode: 'weekly', mm: m[1], hh: m[2], dows: m[3].split(',') };

  // monthly
  m = s.match(/^0\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+\*\s+\?$/);
  if (m) return { mode: 'monthly', mm: m[1], hh: m[2], dom: m[3] };

  return { mode: 'custom' };
};

export type BuildCronParams = {
  mode: CronMode;
  hh: string | number;
  mm: string | number;
  weekdays?: string[];
  monthDay?: string | number;
  custom?: string; // used when mode=custom
};

export const buildCronExpression = (p: BuildCronParams): string => {
  const H = Number(p.hh);
  const M = Number(p.mm);

  if (p.mode === 'daily') return `0 ${M} ${H} * * ?`;

  if (p.mode === 'weekly') {
    const dows = (p.weekdays?.length ? p.weekdays : ['MON']).join(',');
    return `0 ${M} ${H} ? * ${dows}`;
  }

  if (p.mode === 'monthly') {
    const D = Number(p.monthDay ?? 1);
    return `0 ${M} ${H} ${D} * ?`;
  }

  return (p.custom ?? '').trim();
};

export type PreviewParams = BuildCronParams;

export const getCronPreviewText = (p: PreviewParams): string => {
  const time = `${pad2(p.hh)}:${pad2(p.mm)}`;

  if (p.mode === 'daily') return `Runs every day at ${time}.`;

  if (p.mode === 'weekly') {
    const dows = (p.weekdays?.length ? p.weekdays : ['MON']).map((k) => WEEKDAYS.find((w) => w.key === k)?.label ?? k).join(', ');
    return `Runs every week on ${dows} at ${time}.`;
  }

  if (p.mode === 'monthly') {
    const d = Number(p.monthDay ?? 1);
    return `Runs every month on day ${d} at ${time}.`;
  }

  const c = (p.custom ?? '').trim();
  if (c) return `Custom schedule: ${c}`;
  return `Custom schedule: (empty)`;
};
