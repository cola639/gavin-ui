// src/views/user/FilterBar.tsx
import IconTextButton from '@/components/button/IconTextButton';
import { DeleteOutlined, FileExcelOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import { Icon } from 'lucide-react';
import React from 'react';

type Filters = {
  date?: string | null;
  dept?: string | null;
  status?: string | null;
  username?: string;
  phonenumber?: string;
};

type Props = {
  filters: Filters;
  onFilters: (next: Filters) => void;
  onReset: () => void;
  selectedCount: number;
  onAdd: () => void;
  onDelete: () => void;
  onExport: () => void;
};

const FilterBar: React.FC<Props> = ({ filters, onFilters, onReset, selectedCount, onAdd, onDelete, onExport }) => {
  const statusOptions = ['Enabled', 'Disabled'].map((v) => ({ value: v, label: v }));

  // One unified width for all filter controls (other than the "Filter By" pill)
  const FILTER_WIDTH = 160;
  // Compact but consistent width for all buttons
  const BUTTON_WIDTH = 90;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      {/* Everything in one row; will only wrap on very small screens */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter label */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        {/* Username */}
        <Input
          placeholder="Name"
          value={filters.username}
          onChange={(e) => onFilters({ ...filters, username: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Phone */}
        <Input
          placeholder="Phone"
          value={filters.phonenumber}
          onChange={(e) => onFilters({ ...filters, phonenumber: e.target.value })}
          inputMode="tel"
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Department */}
        <Input
          placeholder="Dept"
          value={filters.dept ?? ''}
          onChange={(e) => onFilters({ ...filters, dept: e.target.value || null })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Status */}
        <Select
          className="cus-selector-dropdown"
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          placeholder="Status"
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Actions pushed to the right */}
        <div className="ml-auto flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: BUTTON_WIDTH }}>
            Reset
          </Button>
          <IconTextButton
            type="primary"
            icon={<PlusOutlined />}
            label="Add"
            onClick={onAdd}
            style={{ width: BUTTON_WIDTH }}
            requiredPermission={'system:user:edit'}
          ></IconTextButton>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedCount}
            onClick={() => {
              console.log('DELETE_SELECTED');
              onDelete();
            }}
            style={{ width: BUTTON_WIDTH }}
          >
            Delete
          </Button>

          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={() => {
              console.log('EXPORT_USERS');
              onExport();
            }}
            style={{ width: BUTTON_WIDTH }}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
