// src/apis/dashboard.ts
import type { DashboardResponse, SalesPoint, StatCard } from '@/views/dashboard/types';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ✅ Replace these bodies with real http calls later (axios/fetch/etc).
export async function getDashboardApi(month: string): Promise<DashboardResponse> {
  await sleep(300);

  const stats: StatCard[] = [
    {
      key: 'users',
      title: 'Total User',
      value: 40689,
      valueFormat: 'number',
      trend: { direction: 'up', percent: 8.5, label: 'Up from yesterday' }
    },
    {
      key: 'orders',
      title: 'Total Order',
      value: 10293,
      valueFormat: 'number',
      trend: { direction: 'up', percent: 1.3, label: 'Up from past week' }
    },
    {
      key: 'sales',
      title: 'Total Sales',
      value: 89000,
      valueFormat: 'currency',
      trend: { direction: 'down', percent: 4.3, label: 'Down from yesterday' }
    },
    {
      key: 'pending',
      title: 'Total Pending',
      value: 2040,
      valueFormat: 'number',
      trend: { direction: 'up', percent: 1.8, label: 'Up from yesterday' }
    }
  ];

  const customers = { new: 34249, repeat: 1420 };

  const featuredProduct = {
    name: 'Beats Headphone 2019',
    price: 89,
    subtitle: 'Wireless · Noise cancelling',
    badge: 'Top seller'
  };

  const salesComparison = {
    categories: ['2015', '2016', '2017', '2018', '2019'],
    series: [
      { name: 'New Customers', data: [25, 66, 58, 44, 100] },
      { name: 'Repeated', data: [0, 55, 42, 26, 92] }
    ]
  };

  // mock series that “looks like” the screenshot
  const sales: SalesPoint[] = [
    { x: '5k', value: 20 },
    { x: '8k', value: 30 },
    { x: '10k', value: 48 },
    { x: '12k', value: 40 },
    { x: '15k', value: 32 },
    { x: '18k', value: 52 },
    { x: '20k', value: 88 },
    { x: '22k', value: 35 },
    { x: '25k', value: 50 },
    { x: '28k', value: 42 },
    { x: '30k', value: 46 },
    { x: '33k', value: 60 },
    { x: '35k', value: 25 },
    { x: '38k', value: 32 },
    { x: '40k', value: 28 },
    { x: '43k', value: 72 },
    { x: '45k', value: 58 },
    { x: '47k', value: 66 },
    { x: '50k', value: 53 },
    { x: '53k', value: 52 },
    { x: '55k', value: 42 },
    { x: '57k', value: 56 },
    { x: '60k', value: 50 },
    { x: '62k', value: 55 }
  ];

  return { stats, sales, customers, featuredProduct, salesComparison };
}
