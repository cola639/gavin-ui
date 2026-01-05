// src/views/dashboard/index.tsx
import { Clock, Package, TrendingUp, Users } from 'lucide-react';
import SalesAreaChart from './SalesAreaChart';
import StatCard from './StatCard';
import { useDashboard } from './useDashboard';

export default function DashboardPage() {
  const { data, loading, month, setMonth, months } = useDashboard();

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-6">
      <h1 className="text-4xl font-semibold text-[var(--text-bold)] mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          item={
            data?.stats?.[0] ?? {
              key: 'users',
              title: 'Total User',
              value: 0,
              valueFormat: 'number',
              trend: { direction: 'up', percent: 0, label: '' }
            }
          }
          icon={<Users className="h-6 w-6" />}
          iconVariant="info"
        />
        <StatCard
          item={
            data?.stats?.[1] ?? {
              key: 'orders',
              title: 'Total Order',
              value: 0,
              valueFormat: 'number',
              trend: { direction: 'up', percent: 0, label: '' }
            }
          }
          icon={<Package className="h-6 w-6" />}
          iconVariant="warning"
        />
        <StatCard
          item={
            data?.stats?.[2] ?? {
              key: 'sales',
              title: 'Total Sales',
              value: 0,
              valueFormat: 'currency',
              trend: { direction: 'down', percent: 0, label: '' }
            }
          }
          icon={<TrendingUp className="h-6 w-6" />}
          iconVariant="success"
        />
        <StatCard
          item={
            data?.stats?.[3] ?? {
              key: 'pending',
              title: 'Total Pending',
              value: 0,
              valueFormat: 'number',
              trend: { direction: 'up', percent: 0, label: '' }
            }
          }
          icon={<Clock className="h-6 w-6" />}
          iconVariant="danger"
        />
      </section>

      {/* Sales Details */}
      <section className="mt-7 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-[var(--text-bold)]">Sales Details</h2>

          {/* <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-10 rounded-lg border border-[var(--border-strong)] bg-white px-4 text-sm text-[var(--text-subtle)] outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="mt-5">
          {loading && <div className="py-20 text-center text-[var(--text-muted)]">Loading chart…</div>}

          {!loading && data?.sales && (
            <SalesAreaChart
              data={data.sales}
              tooltipTitle="Sales"
              // You can change to currency later if backend returns dollars
              formatY={(v) => `${v.toFixed(0)}%`}
            />
          )}
        </div>
      </section>
    </main>
  );
}
