// src/views/role/AssignUsersModal.tsx
import { assignUsersToRoleApi, getRoleAllocatedUsersApi, getRoleUnallocatedUsersApi, removeUsersFromRoleApi } from '@/apis/role';
import { Button, Input, Modal, Table, Tabs, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useMemo, useState } from 'react';

type UserRow = {
  userId: number;
  userName: string;
  nickName?: string;
  phonenumber?: string;
  email?: string;
};

type Props = {
  open: boolean;
  roleId: number | null;
  roleName?: string;
  onClose: () => void;
};

const AssignUsersModal: React.FC<Props> = ({ open, roleId, roleName, onClose }) => {
  const [tab, setTab] = useState<'allocated' | 'unallocated'>('unallocated');
  const [kw, setKw] = useState('');

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const columns: ColumnsType<UserRow> = useMemo(
    () => [
      { title: 'USERNAME', dataIndex: 'userName', key: 'userName', render: (v: string) => <span className="font-medium">{v}</span> },
      { title: 'NICKNAME', dataIndex: 'nickName', key: 'nickName' },
      { title: 'PHONE', dataIndex: 'phonenumber', key: 'phonenumber', width: 160 },
      { title: 'EMAIL', dataIndex: 'email', key: 'email' }
    ],
    []
  );

  const fetchList = async (nextPage = pageNum) => {
    if (!roleId) return;
    setLoading(true);
    try {
      const api = tab === 'allocated' ? getRoleAllocatedUsersApi : getRoleUnallocatedUsersApi;
      const res: any = await api({
        roleId,
        pageNum: nextPage,
        pageSize,
        userName: kw.trim() || undefined
      });

      const list: any[] = res?.rows ?? res?.data?.rows ?? res?.data ?? [];
      setRows(
        list.map((u) => ({
          userId: Number(u.userId),
          userName: u.userName ?? '',
          nickName: u.nickName ?? '',
          phonenumber: u.phonenumber ?? '',
          email: u.email ?? ''
        }))
      );

      const t = Number(res?.total ?? res?.data?.total ?? list.length);
      setTotal(t);
      setPageNum(nextPage);
      setSelected([]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setTab('unallocated');
    setKw('');
    setPageNum(1);
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roleId]);

  useEffect(() => {
    if (!open) return;
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, open]);

  const rowSelection: TableRowSelection<UserRow> = {
    selectedRowKeys: selected,
    onChange: (keys) => setSelected(keys)
  };

  const onClickPrimary = async () => {
    if (!roleId) return;
    const userIds = selected.map((k) => Number(k)).filter(Boolean);
    if (!userIds.length) return;

    try {
      if (tab === 'unallocated') {
        await assignUsersToRoleApi({ roleId, userIds });
        message.success('Assigned');
      } else {
        await removeUsersFromRoleApi({ roleId, userIds });
        message.success('Removed');
      }
      fetchList(1);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Operation failed (check assign endpoints in role.ts)');
    }
  };

  return (
    <Modal title={roleName ? `Assign Users - ${roleName}` : 'Assign Users'} open={open} onCancel={onClose} footer={null} width={900} destroyOnClose>
      <div className="flex items-center gap-2 mb-3">
        <Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Search username..." allowClear style={{ width: 260 }} />
        <Button type="primary" onClick={() => fetchList(1)}>
          Search
        </Button>

        <div className="ml-auto">
          <Button type={tab === 'unallocated' ? 'primary' : 'default'} disabled={!selected.length} onClick={onClickPrimary}>
            {tab === 'unallocated' ? 'Add Selected' : 'Remove Selected'}
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as any)}
        items={[
          { key: 'unallocated', label: 'Unallocated Users' },
          { key: 'allocated', label: 'Allocated Users' }
        ]}
      />

      <Table<UserRow>
        rowKey="userId"
        columns={columns}
        dataSource={rows}
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (t) => `Total: ${t}`,
          position: ['bottomRight']
        }}
        onChange={(pager) => fetchList(pager.current ?? 1)}
      />
    </Modal>
  );
};

export default AssignUsersModal;
