import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import FilterBar from './FilterBar';
import OrderTable from './OrderTable';
import { ORDERS } from './data';
import styles from './orders.module.scss';
import { OrderRow, OrderStatus, OrderType } from './types';

const OrdersPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [type, setType] = useState<OrderType | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);

  const filtered = useMemo(() => {
    return ORDERS.filter((r) => {
      if (date && dayjs(r.date).format('YYYY-MM-DD') !== date.format('YYYY-MM-DD')) return false;
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [date, type, status]);

  return (
    <main className={`${styles.ordersWrap} min-h-screen p-5 lg:p-8`}>
      <h1 className="text-3xl font-semibold text-gray-900 mb-5">Order Lists</h1>

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

      <OrderTable data={filtered} pageSize={10} />
    </main>
  );
};

export default OrdersPage;
