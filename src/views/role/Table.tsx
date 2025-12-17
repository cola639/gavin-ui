// src/views/role/Table.tsx
import { DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig, TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import type { RoleRow } from './types';

type Props = {
  data: RoleRow[];
  rowSelection: TableRowSelection<RoleRow>;
  loading?: boolean;

  pagination: { current: number; pageSize: number; total: number };
  onChangePage: (page: number, pageSize: number) => void;

  onModify: (row: RoleRow) => void;
  onDelete: (row: RoleRow) => void;
  onAssignUser: (row: RoleRow) => void;
};

const RolesTable: React.FC<Props> = ({ data, rowSelection, loading, pagination, onChangePage, onModify, onDelete, onAssignUser }) => {
  const columns: ColumnsType<RoleRow> = useMemo(
    () => [
      { title: 'ROLE NAME', dataIndex: 'roleName', key: 'roleName', render: (v: string) => <span className="font-medium">{v}</span> },
      { title: 'ROLE KEY', dataIndex: 'roleKey', key: 'roleKey', width: 180 },
      { title: 'SORT', dataIndex: 'roleSort', key: 'roleSort', width: 90 },
      {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: RoleRow['status']) =>
          s === 'Enabled' ? (
            <Tag color="#9fe2dc" className="text-[#065f5b] font-semibold rounded-full px-3 py-[2px]">
              Enabled
            </Tag>
          ) : (
            <Tag color="#fde68a" className="text-[#92400e] font-semibold rounded-full px-3 py-[2px]">
              Disabled
            </Tag>
          )
      },
      {
        title: 'CREATETIME',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 170,
        render: (v: string) => (v ? new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '-')
      },
      {
        title: 'ACTION',
        key: 'action',
        fixed: 'right',
        width: 300,
        render: (_: any, row: RoleRow) => (
          <div className="flex items-center gap-2">
            <Button icon={<EditOutlined />} onClick={() => onModify(row)}>
              Modify
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(row)}>
              Delete
            </Button>
            <Button icon={<TeamOutlined />} onClick={() => onAssignUser(row)}>
              Assign User
            </Button>
          </div>
        )
      }
    ],
    [onAssignUser, onDelete, onModify]
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
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] overflow-hidden">
      <Table<RoleRow>
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection}
        loading={loading}
        pagination={tablePagination}
        onChange={(pager) => onChangePage(pager.current ?? 1, pager.pageSize ?? pagination.pageSize)}
      />
    </div>
  );
};

export default RolesTable;
