import { DeleteOutlined, FileExcelOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select } from 'antd';
import React from 'react';

type Filters = {
  date?: string | null;
  dept?: string | null; // dropdown value
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
  const deptOptions = ['Design', 'Engineering', 'Finance', 'HR', 'Medicine', 'Mobile', 'Watch'].map((v) => ({
    value: v,
    label: v
  }));

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        {/* Username */}
        <Input
          placeholder="Username"
          value={filters.username}
          onChange={(e) => onFilters({ ...filters, username: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
        <Input
          placeholder="Phone"
          value={filters.phonenumber}
          onChange={(e) => onFilters({ ...filters, phonenumber: e.target.value })}
          inputMode="tel" // mobile keypad
          style={{ width: 160 }}
          allowClear
        />

        <Input
          placeholder="Department"
          value={filters.dept}
          onChange={(e) => onFilters({ ...filters, dept: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />

        {/* Status */}
        <Select
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          placeholder="Status"
          allowClear
          className="min-w-[140px]"
        />

        <div className="flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              console.log('ADD_USER_CLICK');
              onAdd();
            }}
          >
            Add
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedCount}
            onClick={() => {
              console.log('DELETE_SELECTED');
              onDelete();
            }}
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
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
