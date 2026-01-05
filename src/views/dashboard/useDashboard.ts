// src/views/dashboard/useDashboard.ts
import { getDashboardApi } from '@/apis/dashboard';
import { useEffect, useMemo, useState } from 'react';
import type { DashboardResponse } from './types';

export function useDashboard() {
  const [month, setMonth] = useState('October');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const res = await getDashboardApi(month);
        if (!cancelled) setData(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const months = useMemo(() => ['August', 'September', 'October', 'November'], []);

  return {
    month,
    setMonth,
    months,
    data,
    loading
  };
}
