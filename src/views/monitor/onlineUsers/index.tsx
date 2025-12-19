// src/views/monitor/onlineUsers/index.tsx
import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import OnlineUsersFilterBar, { OnlineUserFilters } from './FilterBar';
import OnlineUsersTable from './Table';
import type { OnlineUserRow } from './type';

import { forceLogoutApi, getOnlineUsersApi, type OnlineUserApiRow } from '@/apis/onlineUsers';

const DEFAULT_FILTERS: OnlineUserFilters = { ipaddr: '', userName: '' };

const toRow = (r: OnlineUserApiRow): OnlineUserRow => ({
  tokenId: r.tokenId,
  deptName: r.deptName ?? '',
  userName: r.userName ?? '',
  ipaddr: r.ipaddr ?? '',
  loginLocation: r.loginLocation ?? '',
  browser: r.browser ?? '',
  os: r.os ?? '',
  loginTime: typeof r.loginTime === 'number' ? r.loginTime : null
});

const OnlineUsersPage: React.FC = () => {
  const [filters, setFilters] = useState<OnlineUserFilters>(DEFAULT_FILTERS);

  const [rows, setRows] = useState<OnlineUserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // allow “force refresh” even if query didn't change (ex: clicking Reset twice)
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  // only accept latest response
  const reqSeq = useRef(0);

  const query = useMemo(
    () => ({
      pageNum,
      pageSize,
      ipaddr: filters.ipaddr.trim() || undefined,
      userName: filters.userName.trim() || undefined
    }),
    [filters.ipaddr, filters.userName, pageNum, pageSize]
  );

  // ✅ auto fetch on any query change (debounced)
  useEffect(() => {
    const seq = ++reqSeq.current;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res: any = await getOnlineUsersApi(query);
        if (seq !== reqSeq.current) return;

        const list: OnlineUserApiRow[] = res?.rows ?? res?.data?.rows ?? [];
        setRows(list.map(toRow));
        setTotal(Number(res?.total ?? res?.data?.total ?? list.length));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('Failed to load online users');
      } finally {
        if (seq === reqSeq.current) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, refreshKey]);

  const handleFilters = (next: OnlineUserFilters) => {
    setFilters(next);
    setPageNum(1); // ✅ reset to first page when filters change
  };

  const onReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPageNum(1);
    setPageSize(10);
    bumpRefresh(); // ✅ always fetch even if already default
  };

  const onForceLogout = (row: OnlineUserRow) => {
    Modal.confirm({
      title: 'Force logout?',
      content: `Are you sure you want to force logout "${row.userName}"?`,
      okText: 'Logout',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await forceLogoutApi(row.tokenId);
          message.success('Forced logout');
          bumpRefresh();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          message.error('Force logout failed');
        }
      }
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Online Users</h1>

      <OnlineUsersFilterBar filters={filters} onFilters={handleFilters} onReset={onReset} />

      <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4">
        <OnlineUsersTable
          data={rows}
          loading={loading}
          pagination={{ current: pageNum, pageSize, total }}
          onChangePage={(p, ps) => {
            setPageNum(p);
            setPageSize(ps);
          }}
          onForceLogout={onForceLogout}
        />
      </div>
    </main>
  );
};

export default OnlineUsersPage;
