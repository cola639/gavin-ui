// src/views/dashboard/index.tsx
import { ChevronLeft, ChevronRight, Clock, Package, TrendingUp, Users } from 'lucide-react';
import CustomerDonutChart from './CustomerDonutChart';
import SalesAreaChart from './SalesAreaChart';
import SalesComparisonChart from './SalesComparisonChart';
import StatCard from './StatCard';
import { useDashboard } from './useDashboard';

export default function DashboardPage() {
  const { data, loading, month, setMonth, months } = useDashboard();

  const customerBreakdown = data?.customers ?? { new: 34249, repeat: 1420 };
  const featuredProduct = data?.featuredProduct ?? {
    name: 'Beats Headphone 2019',
    price: 89,
    subtitle: 'Wireless · Noise cancelling',
    badge: 'Top seller'
  };
  const salesComparison = data?.salesComparison ?? {
    categories: ['2015', '2016', '2017', '2018', '2019'],
    series: [
      { name: 'New Customers', data: [25, 66, 58, 44, 100] },
      { name: 'Repeated', data: [0, 55, 42, 26, 92] }
    ]
  };

  return (
    <main className="">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Dashboard</h1>
      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <section className="mt-6 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow)] p-5">
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

        <div className="mt-4">
          {loading && <div className="py-14 text-center text-[var(--text-muted)]">Loading chart…</div>}

          {!loading && data?.sales && (
            <SalesAreaChart
              data={data.sales}
              tooltipTitle="Sales"
              height={260}
              // You can change to currency later if backend returns dollars
              formatY={(v) => `${v.toFixed(0)}%`}
            />
          )}
        </div>
      </section>

      {/* Bottom cards */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[var(--text-bold)]">Customers</h3>
            <span className="text-sm text-[var(--text-muted)]">This month</span>
          </div>
          <div className="mt-2">
            <CustomerDonutChart newCount={customerBreakdown.new} repeatCount={customerBreakdown.repeat} />
          </div>
          <div className="mt-2 flex items-center justify-around text-center">
            <div>
              <div className="text-2xl font-semibold text-[var(--text-bold)]">{customerBreakdown.new.toLocaleString()}</div>
              <div className="mt-1 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="h-3 w-3 rounded-full bg-[var(--info)]" />
                <span>New Customers</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-[var(--text-bold)]">{customerBreakdown.repeat.toLocaleString()}</div>
              <div className="mt-1 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="h-3 w-3 rounded-full bg-[var(--primary-light)]" />
                <span>Repeated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[var(--text-bold)]">Featured Product</h3>
            {featuredProduct.badge && (
              <span className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-subtle)]">
                {featuredProduct.badge}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="h-10 w-10 rounded-full bg-[var(--bg-muted)] text-[var(--text-subtle)] transition hover:bg-[var(--bg-hover)]"
              aria-label="Previous product"
            >
              <ChevronLeft className="mx-auto h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-lg font-semibold text-[var(--text-bold)]">{featuredProduct.name}</div>
              {featuredProduct.subtitle && <div className="mt-2 text-sm text-[var(--text-muted)]">{featuredProduct.subtitle}</div>}
              <div className="mt-3 text-2xl font-semibold text-[var(--primary-strong)]">${featuredProduct.price.toFixed(2)}</div>
              <div className="mt-4 flex h-16 items-end justify-center gap-2">
                {[62, 54, 78, 66, 90].map((v, idx) => (
                  <span key={idx} className="block w-3 rounded-full bg-[var(--primary-light)]" style={{ height: `${Math.max(24, v / 1.4)}px` }} />
                ))}
              </div>
            </div>
            <button
              className="h-10 w-10 rounded-full bg-[var(--bg-muted)] text-[var(--text-subtle)] transition hover:bg-[var(--bg-hover)]"
              aria-label="Next product"
            >
              <ChevronRight className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[var(--text-bold)]">Sales Analytics</h3>
            <span className="text-sm text-[var(--text-muted)]">2015 - 2019</span>
          </div>
          <div className="mt-3">
            <SalesComparisonChart categories={salesComparison.categories} series={salesComparison.series} />
          </div>
        </div>
      </section>
    </main>
  );
}
