// src/views/dashboard/types.ts
export type TrendDirection = 'up' | 'down';

export type StatCard = {
  key: 'users' | 'orders' | 'sales' | 'pending';
  title: string;
  value: number;
  valueFormat: 'number' | 'currency';
  trend: {
    direction: TrendDirection;
    percent: number; // 8.5 => 8.5%
    label: string; // "Up from yesterday"
  };
};

export type SalesPoint = {
  x: string; // label on x-axis (e.g. "5k", "10k" or "01", "02")
  value: number; // numeric value
};

export type DashboardResponse = {
  stats: StatCard[];
  sales: SalesPoint[];
};
