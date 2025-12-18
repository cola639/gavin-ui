import { assignUsersToRoleApi, getRoleAllocatedUsersApi, getRoleUnallocatedUsersApi, removeUsersFromRoleApi } from '@/apis/role';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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

  // search fields
  const [kw, setKw] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const INPUT_W = 220;
  const BTN_W = 120;

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
        userName: kw.trim() || undefined,
        phonenumber: phone.trim() || undefined
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

      // clear selection on every fetch
      setSelected([]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // reset when opening / role changes
  useEffect(() => {
    if (!open) return;
    setTab('unallocated');
    setKw('');
    setPhone('');
    setPageNum(1);
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roleId]);

  // reload list when tab changes
  useEffect(() => {
    if (!open) return;
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, open, roleId]);

  const rowSelection: TableRowSelection<UserRow> = {
    selectedRowKeys: selected,
    onChange: (keys) => setSelected(keys)
  };

  const onSearch = () => fetchList(1);

  const onClickPrimary = async () => {
    if (!roleId) return;

    const userIds = selected.map((k) => Number(k)).filter((n) => Number.isFinite(n));
    if (!userIds.length) return;

    try {
      if (tab === 'unallocated') {
        await assignUsersToRoleApi({ roleId, userIds });
        message.success('Batch assign success');
      } else {
        await removeUsersFromRoleApi({ roleId, userIds });
        message.success('Batch revoke success');
      }

      // ✅ refresh list after update
      await fetchList(1);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Operation failed');
    }
  };

  const isRemove = tab === 'allocated';

  return (
    <Modal title={roleName ? `Assign Users - ${roleName}` : 'Assign Users'} open={open} onCancel={onClose} footer={null} width={980} destroyOnClose>
      {/* Tabs + checkbox theming */}
      <style>
        {`
          .roleAssignTabs .ant-tabs-ink-bar { background: var(--primary) !important; }
          .roleAssignTabs .ant-tabs-tab-btn { font-weight: 700 !important; color: var(--primary) !important; opacity: 0.65; }
          .roleAssignTabs .ant-tabs-tab:hover .ant-tabs-tab-btn { opacity: 0.9; }
          .roleAssignTabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn { opacity: 1 !important; }

          .roleAssignTable .ant-checkbox-checked .ant-checkbox-inner {
            background-color: var(--primary) !important;
            border-color: var(--primary) !important;
          }
          .roleAssignTable .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .roleAssignTable .ant-checkbox:hover .ant-checkbox-inner,
          .roleAssignTable .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: var(--primary) !important;
          }
        `}
      </style>

      {/* Search row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          onPressEnter={onSearch}
          placeholder="Search username..."
          allowClear
          style={{ width: INPUT_W }}
        />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onPressEnter={onSearch}
          placeholder="Search phone..."
          allowClear
          style={{ width: INPUT_W }}
        />

        {/* Buttons on right */}
        <div className="ml-auto flex items-center gap-2">
          <Button type={'primary'} icon={<SearchOutlined />} onClick={onSearch} style={{ width: BTN_W }}>
            Search
          </Button>

          <Button
            type={isRemove ? 'default' : 'primary'}
            danger={isRemove}
            icon={isRemove ? <DeleteOutlined /> : <PlusOutlined />}
            disabled={!selected.length}
            onClick={onClickPrimary}
            style={{ width: BTN_W }}
          >
            {isRemove ? 'Remove' : 'Add'}
          </Button>
        </div>
      </div>

      <Tabs
        className="roleAssignTabs"
        activeKey={tab}
        onChange={(k) => setTab(k as any)}
        items={[
          { key: 'allocated', label: 'Allocated Users' },
          { key: 'unallocated', label: 'Unallocated Users' }
        ]}
      />

      <Table<UserRow>
        className="roleAssignTable"
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
