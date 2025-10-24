import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, KeyOutlined, MoreOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Dropdown, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import { UserRow } from './types';

type Props = {
  data: UserRow[];
  rowSelection: TableRowSelection<UserRow>;
  onModify: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
  onToggleVisible: (row: UserRow) => void;
  onResetPass: (row: UserRow) => void;
  onAssignRole: (row: UserRow) => void;
};

const UsersTable: React.FC<Props> = ({ data, rowSelection, onModify, onDelete, onToggleVisible, onResetPass, onAssignRole }) => {
  const columns: ColumnsType<UserRow> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 110 },
      { title: 'USERNAME', dataIndex: 'username', key: 'username', render: (v: string) => <span className="font-medium">{v}</span> },
      {
        title: 'AVATAR',
        dataIndex: 'avatar',
        key: 'avatar',
        width: 90,
        render: (src: string) => <img src={src} alt="avatar" className="h-10 w-10 rounded-full object-cover shadow" />
      },
      { title: 'DEPARTMENT', dataIndex: 'department', key: 'department' },
      { title: 'PHONE', dataIndex: 'phone', key: 'phone', width: 160 },
      {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: UserRow['status']) =>
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
        width: 160,
        render: (v: string) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
      },
      {
        title: 'ACTION',
        key: 'action',
        fixed: 'right',
        width: 260,
        render: (_: any, row: UserRow) => {
          const menuItems = [
            {
              key: 'visible',
              icon: row.visible ? <EyeInvisibleOutlined /> : <EyeOutlined />,
              label: row.visible ? 'Hide user' : 'Show user',
              onClick: () => onToggleVisible(row)
            },
            { key: 'reset', icon: <KeyOutlined />, label: 'Reset passcode', onClick: () => onResetPass(row) },
            { key: 'assign', icon: <TeamOutlined />, label: 'Assign role', onClick: () => onAssignRole(row) }
          ];
          return (
            <div className="flex items-center gap-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  console.log('MODIFY', row.id);
                  onModify(row);
                }}
              >
                Modify
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  console.log('DELETE', row.id);
                  onDelete(row);
                }}
              >
                Delete
              </Button>
              <Dropdown
                menu={{ items: menuItems.map((i) => ({ key: i.key, icon: i.icon, label: i.label, onClick: i.onClick })) }}
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />}>More</Button>
              </Dropdown>
            </div>
          );
        }
      }
    ],
    [onModify, onDelete, onToggleVisible, onResetPass, onAssignRole]
  );

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-white shadow-[var(--shadow)] overflow-hidden">
      <Table rowKey="id" columns={columns} dataSource={data} rowSelection={rowSelection} pagination={{ pageSize: 10, showSizeChanger: false }} />
    </div>
  );
};

export default UsersTable;
