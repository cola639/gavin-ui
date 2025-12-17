import { DeleteOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import React from 'react';

export type RoleFilters = {
  roleName?: string;
  status?: string | null; // 'Enabled' | 'Disabled' | null
};

type Props = {
  filters: RoleFilters;
  onFilters: (next: RoleFilters) => void;

  onReset: () => void;

  selectedCount: number;
  onAdd: () => void;
  onDelete: () => void;
};

const RoleFilterBar: React.FC<Props> = ({ filters, onFilters, onReset, selectedCount, onAdd, onDelete }) => {
  const statusOptions = ['Enabled', 'Disabled'].map((v) => ({ value: v, label: v }));

  const FILTER_WIDTH = 160;
  const BUTTON_WIDTH = 90;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter label (same as User) */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        <Input
          placeholder="Role Name"
          value={filters.roleName}
          onChange={(e) => onFilters({ ...filters, roleName: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <Select
          className="cus-selector-dropdown"
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          placeholder="Status"
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Actions right aligned (NO Search) */}
        <div className="ml-auto flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: BUTTON_WIDTH }}>
            Reset
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ width: BUTTON_WIDTH }}>
            Add
          </Button>

          <Button danger icon={<DeleteOutlined />} disabled={!selectedCount} onClick={onDelete} style={{ width: BUTTON_WIDTH }}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleFilterBar;
