import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import ActionBar from './ActionBar';
import { ORDERS as SEED } from './data';
import FilterBar from './FilterBar';
import styles from './orders.module.scss';
import OrderTable from './OrderTable';
import { OrderRow, OrderStatus, OrderType } from './types';

const OrdersPage: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>(SEED); // local data source
  const [date, setDate] = useState<Dayjs | null>(null);
  const [type, setType] = useState<OrderType | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);

  // filter
  const filtered: OrderRow[] = useMemo(() => {
    return rows.filter((r) => {
      if (date && dayjs(r.date).format('YYYY-MM-DD') !== date.format('YYYY-MM-DD')) return false;
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [rows, date, type, status]);

  // selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  function toggleSelectAll(checked: boolean) {
    setSelectedRowKeys(checked ? filtered.map((r) => r.id) : []);
  }

  // delete selected (no API)
  function handleDelete() {
    const next = rows.filter((r) => !selectedRowKeys.includes(r.id));
    console.log('DELETE_ROWS', selectedRowKeys);
    setRows(next);
    setSelectedRowKeys([]);
  }

  // export CSV for visible (filtered) rows
  function handleExport() {
    const header = ['ID', 'NAME', 'ADDRESS', 'DATE', 'TYPE', 'STATUS'];
    const body = filtered.map((r) => [r.id, r.name, r.address, dayjs(r.date).format('YYYY-MM-DD'), r.type, r.status]);
    const csv = [header, ...body].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${dayjs().format('YYYYMMDD_HHmmss')}.csv`; // Excel-friendly
    a.click();
    URL.revokeObjectURL(url);
    console.log('EXPORT_CSV_ROWS', filtered.length);
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Order Lists</h1>

      <FilterBar
        date={date}
        type={type}
        status={status}
        onChange={(next) => {
          setDate(next.date ?? null);
          setType(next.type ?? null);
          setStatus(next.status ?? null);
        }}
        onReset={() => {
          setDate(null);
          setType(null);
          setStatus(null);
        }}
      />

      {/* NEW: Action Bar */}
      <ActionBar allRows={filtered} selectedKeys={selectedRowKeys} onDelete={handleDelete} onExport={handleExport} />

      {/* Table with external selection control */}
      <OrderTable
        data={filtered}
        pageSize={10}
        // forward selection handlers via props (see next snippet)
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
      />
    </main>
  );
};

export default OrdersPage;
