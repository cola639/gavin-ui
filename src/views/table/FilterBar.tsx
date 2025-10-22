import { Button, DatePicker, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Filter, RotateCcw } from 'lucide-react';
import React, { useMemo } from 'react';
import styles from './orders.module.scss';
import type { OrderStatus, OrderType } from './types';

type Props = {
  date?: Dayjs | null;
  type?: OrderType | null;
  status?: OrderStatus | null;
  onChange: (next: { date?: Dayjs | null; type?: OrderType | null; status?: OrderStatus | null }) => void;
  onReset: () => void;
};

const FilterBar: React.FC<Props> = ({ date, type, status, onChange, onReset }) => {
  const typeOptions = useMemo(() => ['Electric', 'Book', 'Medicine', 'Mobile', 'Watch'].map((v) => ({ value: v, label: v })), []);
  const statusOptions = useMemo(() => ['Completed', 'Processing', 'Rejected'].map((v) => ({ value: v, label: v })), []);

  return (
    <div className={`${styles.filterCard} mb-6`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter By</span>
        </div>

        <DatePicker
          value={date ?? null}
          onChange={(d) => {
            onChange({ date: d ?? null, type, status });
            console.log('Filter: date', d?.format('YYYY-MM-DD'));
          }}
          className="min-w-[180px]"
          allowClear
        />

        <Select
          value={type ?? undefined}
          onChange={(v) => {
            onChange({ date, type: (v as OrderType) ?? null, status });
            console.log('Filter: type', v);
          }}
          placeholder="Order Type"
          options={typeOptions}
          allowClear
          className="min-w-[160px]"
        />

        <Select
          value={status ?? undefined}
          onChange={(v) => {
            onChange({ date, type, status: (v as OrderStatus) ?? null });
            console.log('Filter: status', v);
          }}
          placeholder="Order Status"
          options={statusOptions}
          allowClear
          className="min-w-[160px]"
        />

        <div className="ml-auto">
          <Button
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              onReset();
              console.log('Filter: reset');
            }}
          >
            Reset Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
