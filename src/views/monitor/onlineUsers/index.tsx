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
  // input filters (not applied until Search)
  const [filters, setFilters] = useState<OnlineUserFilters>(DEFAULT_FILTERS);
  // applied filters (used by query)
  const [applied, setApplied] = useState<OnlineUserFilters>(DEFAULT_FILTERS);

  const [rows, setRows] = useState<OnlineUserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // allow “force refresh” even if page is already 1
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  // only accept latest response
  const reqSeq = useRef(0);

  const query = useMemo(
    () => ({
      pageNum,
      pageSize,
      ipaddr: applied.ipaddr.trim() || undefined,
      userName: applied.userName.trim() || undefined
    }),
    [applied.ipaddr, applied.userName, pageNum, pageSize]
  );

  useEffect(() => {
    const seq = ++reqSeq.current;

    (async () => {
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
    })();
  }, [query, refreshKey]);

  const onSearch = () => {
    setApplied(filters);
    setPageNum(1);
    bumpRefresh();
  };

  const onReset = () => {
    setFilters(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setPageNum(1);
    setPageSize(10);
    bumpRefresh();
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
          // refresh current page
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

      <OnlineUsersFilterBar filters={filters} onFilters={setFilters} onSearch={onSearch} onReset={onReset} />

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
