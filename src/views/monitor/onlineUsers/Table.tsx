// src/views/monitor/onlineUsers/Table.tsx
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import type { OnlineUserRow } from './type';

type Props = {
  data: OnlineUserRow[];
  loading?: boolean;

  pagination: { current: number; pageSize: number; total: number };
  onChangePage: (page: number, pageSize: number) => void;

  onForceLogout: (row: OnlineUserRow) => void;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const formatTime = (ms?: number | null) => {
  if (!ms) return '-';
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const OnlineUsersTable: React.FC<Props> = ({ data, loading, pagination, onChangePage, onForceLogout }) => {
  const columns: ColumnsType<OnlineUserRow> = useMemo(
    () => [
      {
        title: 'NO.',
        key: 'no',
        width: 70,
        render: (_: any, __: OnlineUserRow, idx: number) => (
          <span className="text-[var(--text-muted)]">{(pagination.current - 1) * pagination.pageSize + idx + 1}</span>
        )
      },
      {
        title: 'SESSION ID',
        dataIndex: 'tokenId',
        key: 'tokenId',
        width: 260,
        render: (v: string) => <span className="text-[var(--text-muted)]">{v}</span>
      },
      { title: 'USERNAME', dataIndex: 'userName', key: 'userName', width: 140, render: (v: string) => <span className="font-medium">{v}</span> },
      { title: 'DEPT', dataIndex: 'deptName', key: 'deptName', width: 140 },
      { title: 'HOST', dataIndex: 'ipaddr', key: 'ipaddr', width: 140 },
      { title: 'LOCATION', dataIndex: 'loginLocation', key: 'loginLocation', width: 140 },
      { title: 'BROWSER', dataIndex: 'browser', key: 'browser', width: 140 },
      { title: 'OS', dataIndex: 'os', key: 'os', width: 140 },
      {
        title: 'LOGIN TIME',
        dataIndex: 'loginTime',
        key: 'loginTime',
        width: 180,
        render: (v: number | null) => formatTime(v)
      },
      {
        title: 'ACTION',
        key: 'action',
        width: 150,
        render: (_: any, row: OnlineUserRow) => (
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => onForceLogout(row)}
            style={{ color: '#faad14' }} // antd warning gold
          >
            Force Logout
          </Button>
        )
      }
    ],
    [onForceLogout, pagination.current, pagination.pageSize]
  );

  const tablePagination: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: (total) => `Total: ${total}`,
    position: ['bottomRight']
  };

  return (
    <Table<OnlineUserRow>
      rowKey="tokenId"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={tablePagination}
      onChange={(pager) => onChangePage(pager.current ?? 1, pager.pageSize ?? pagination.pageSize)}
      scroll={{ x: 'max-content' }} // ✅ show all columns
    />
  );
};

export default OnlineUsersTable;
