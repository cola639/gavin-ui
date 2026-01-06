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

export type CustomerBreakdown = {
  new: number;
  repeat: number;
};

export type FeaturedProduct = {
  name: string;
  price: number;
  subtitle?: string;
  badge?: string;
};

export type ComparisonSeries = {
  name: string;
  data: number[];
  color?: string;
};

export type SalesComparison = {
  categories: string[];
  series: ComparisonSeries[];
};

export type DashboardResponse = {
  stats: StatCard[];
  sales: SalesPoint[];
  customers?: CustomerBreakdown;
  featuredProduct?: FeaturedProduct;
  salesComparison?: SalesComparison;
};
