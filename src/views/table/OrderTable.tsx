import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import styles from './orders.module.scss';
import { OrderRow } from './types';

const StatusBadge: React.FC<{ status: OrderRow['status'] }> = ({ status }) => {
  const cls =
    status === 'Completed'
      ? `${styles.badge} ${styles.badgeCompleted}`
      : status === 'Processing'
        ? `${styles.badge} ${styles.badgeProcessing}`
        : `${styles.badge} ${styles.badgeRejected}`;
  return <span className={cls}>{status}</span>;
};

const OrderTable: React.FC<{
  data: OrderRow[];
  pageSize?: number;
  rowSelection?: TableRowSelection<OrderRow>;
}> = ({ data, pageSize = 10, rowSelection }) => {
  const columns: ColumnsType<OrderRow> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 110 },
      { title: 'NAME', dataIndex: 'name', key: 'name' },
      { title: 'ADDRESS', dataIndex: 'address', key: 'address', responsive: ['lg'] },
      {
        title: 'DATE',
        dataIndex: 'date',
        key: 'date',
        width: 160,
        render: (v: string) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
      },
      { title: 'TYPE', dataIndex: 'type', key: 'type', width: 120 },
      { title: 'STATUS', dataIndex: 'status', key: 'status', width: 140, render: (_, r) => <StatusBadge status={r.status} /> }
    ],
    []
  );

  return (
    <div className={styles.tableCard}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection}
        pagination={{ pageSize, showSizeChanger: false }}
        onChange={(pg, filters, sorter) => {
          console.log('Table change:', { pg, filters, sorter });
        }}
      />
    </div>
  );
};

export default OrderTable;
