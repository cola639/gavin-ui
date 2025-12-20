import { DeleteOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select } from 'antd';
import React from 'react';

export type JobFilters = {
  jobName: string;
  jobGroup: string | null;
  status: '0' | '1' | null;
};

export type LogFilters = {
  jobName: string;
  jobGroup: string | null;
  status: '0' | '1' | null; // 0 success / 1 fail
  range?: any[] | null; // dayjs range (keep loose to avoid type friction)
};

const FILTER_WIDTH = 220;
const BUTTON_WIDTH = 90;

const jobGroupOptions = [{ value: 'DEFAULT', label: 'DEFAULT' }];

export const JobsFilterBar: React.FC<{
  filters: JobFilters;
  onFilters: (next: JobFilters) => void;
  onReset: () => void;
  selectedCount: number;
  onNew: () => void;
  onDelete: () => void;
}> = ({ filters, onFilters, onReset, selectedCount, onNew, onDelete }) => {
  const statusOptions = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'Paused' }
  ];

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        {/* Task Name */}
        <Input
          placeholder="Task Name"
          value={filters.jobName}
          onChange={(e) => onFilters({ ...filters, jobName: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        {/* Group */}
        <Select
          className="cus-selector-dropdown"
          placeholder="Task Group"
          value={filters.jobGroup ?? undefined}
          onChange={(v) => onFilters({ ...filters, jobGroup: v ?? null })}
          options={jobGroupOptions}
          allowClear
          showSearch
          style={{ width: FILTER_WIDTH }}
        />

        {/* Status */}
        <Select
          className="cus-selector-dropdown"
          placeholder="Status"
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: BUTTON_WIDTH }}>
            Reset
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={onNew} style={{ width: BUTTON_WIDTH }}>
            New
          </Button>

          <Button danger icon={<DeleteOutlined />} disabled={!selectedCount} onClick={onDelete} style={{ width: BUTTON_WIDTH }}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export const LogsFilterBar: React.FC<{
  filters: LogFilters;
  onFilters: (next: LogFilters) => void;
  onReset: () => void;
  selectedCount: number;
  onDelete: () => void;
  onClean: () => void;
  onClose: () => void;
}> = ({ filters, onFilters, onReset, selectedCount, onDelete, onClean, onClose }) => {
  const statusOptions = [
    { value: '0', label: 'Success' },
    { value: '1', label: 'Fail' }
  ];

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] p-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-[var(--text-muted)]">
          <FilterOutlined />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        <Input
          placeholder="Task Name"
          value={filters.jobName}
          onChange={(e) => onFilters({ ...filters, jobName: e.target.value })}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <Select
          className="cus-selector-dropdown"
          placeholder="Task Group"
          value={filters.jobGroup ?? undefined}
          onChange={(v) => onFilters({ ...filters, jobGroup: v ?? null })}
          options={jobGroupOptions}
          allowClear
          showSearch
          style={{ width: FILTER_WIDTH }}
        />

        <Select
          className="cus-selector-dropdown"
          placeholder="Execution Status"
          value={filters.status ?? undefined}
          onChange={(v) => onFilters({ ...filters, status: v ?? null })}
          options={statusOptions}
          allowClear
          style={{ width: FILTER_WIDTH }}
        />

        <DatePicker.RangePicker
          value={(filters.range as any) ?? null}
          onChange={(v) => onFilters({ ...filters, range: (v as any) ?? null })}
          style={{ width: 320 }}
          allowEmpty={[true, true]}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: BUTTON_WIDTH }}>
            Reset
          </Button>

          <Button danger icon={<DeleteOutlined />} disabled={!selectedCount} onClick={onDelete} style={{ width: BUTTON_WIDTH }}>
            Delete
          </Button>

          <Button onClick={onClean} style={{ width: BUTTON_WIDTH }}>
            Clean
          </Button>

          <Button onClick={onClose} style={{ width: BUTTON_WIDTH }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
