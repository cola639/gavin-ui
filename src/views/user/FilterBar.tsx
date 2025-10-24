import { DeleteOutlined, FileExcelOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select } from 'antd';
import React from 'react';

type Props = {
  filters: { date?: string | null; dept?: string | null; status?: string | null; keyword?: string };
  onFilters: (next: Props['filters']) => void;
  onReset: () => void;

  // actions
  selectedCount: number;
  onAdd: () => void;
  onDelete: () => void;
  onExport: () => void;
};

const FilterBar: React.FC<Props> = ({ filters, onFilters, onReset, selectedCount, onAdd, onDelete, onExport }) => {
  const deptOptions = ['Design', 'Engineering', 'Finance', 'HR', 'Medicine', 'Mobile', 'Watch'].map((v) => ({ value: v, label: v }));
  const statusOptions = ['Enabled', 'Disabled'].map((v) => ({ value: v, label: v }));

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        <Input
          placeholder="Search username / phone"
          value={filters.keyword}
          onChange={(e) => onFilters({ ...filters, keyword: e.target.value })}
          className="w-[220px]"
        />

        <DatePicker
          value={filters.date ? (window as any).dayjs?.(filters.date) : undefined}
          onChange={(d) => onFilters({ ...filters, date: d ? d.format('YYYY-MM-DD') : null })}
          allowClear
          className="min-w-[160px]"
        />

        <Select
          value={filters.dept ?? undefined}
          onChange={(v) => onFilters({ ...filters, dept: v ?? null })}
          options={deptOptions}
          placeholder="Department"
          allowClear
          className="min-w-[160px]"
        />

        <Select
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          placeholder="Status"
          allowClear
          className="min-w-[140px]"
        />

        <div className="ml-auto flex items-center gap-2">
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
