// src/views/monitor/onlineUsers/FilterBar.tsx
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React from 'react';

export type OnlineUserFilters = {
  ipaddr: string;
  userName: string;
};

type Props = {
  filters: OnlineUserFilters;
  onFilters: (next: OnlineUserFilters) => void;

  onSearch: () => void;
  onReset: () => void;
};

const OnlineUsersFilterBar: React.FC<Props> = ({ filters, onFilters, onSearch, onReset }) => {
  const FILTER_WIDTH = 200;
  const BUTTON_WIDTH = 90;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        <Input
          placeholder="Login Address"
          value={filters.ipaddr}
          onChange={(e) => onFilters({ ...filters, ipaddr: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <Input
          placeholder="User Name"
          value={filters.userName}
          onChange={(e) => onFilters({ ...filters, userName: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch} style={{ width: BUTTON_WIDTH }}>
            Search
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: BUTTON_WIDTH }}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersFilterBar;
