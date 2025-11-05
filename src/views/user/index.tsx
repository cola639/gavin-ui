import { addUserApi, deleteUserApi, getUsersApi, updateUserApi } from '@/apis/user';
import AvatarCell from '@/components/avatarCell';
import UserForm, { UserFormValues } from '@/components/form';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterBar from './FilterBar';
import UsersTable from './Table';
import { UserRow } from './types';

type ApiUser = {
  userId: number;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  status: '0' | '1';
  loginDate: string; // using as createTime
  deptId: number;
  deptName: string;
};

const toRow = (u: ApiUser): UserRow => ({
  id: String(u.userId),
  username: u.userName,
  avatar: '', // backend sample has no avatar field
  department: u.deptName,
  phone: u.phonenumber,
  status: u.status === '0' ? 'Enabled' : 'Disabled',
  createTime: u.loginDate,
  visible: true
});

const UsersPage: React.FC = () => {
  // source of truth
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [filters, setFilters] = useState<{ date?: string | null; dept?: string | null; status?: string | null; keyword?: string }>({
    date: null,
    dept: null,
    status: null,
    keyword: ''
  });

  // selection
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | UserRow>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: 1,
        pageSize: 20,
        userName: filters.keyword || undefined,
        phonenumber: undefined,
        deptId: undefined,
        status: filters.status === 'Enabled' ? '0' : filters.status === 'Disabled' ? '1' : undefined,
        beginTime: filters.date || undefined,
        endTime: filters.date || undefined
      };
      const res: any = await getUsersApi(params);
      // expecting res.data.rows based on Axios response structure
      const list: ApiUser[] = res.rows ?? [];
      setRows(list.map(toRow));
      console.log('GET_USERS', params, res);
    } catch (e) {
      console.error(e);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    // if backend already filtered, just return rows; keep client-side safety for keyword
    if (!filters.keyword) return rows;
    return rows.filter((r) => r.username.includes(filters.keyword!));
  }, [rows, filters.keyword]);

  // actions
  const handleAdd = async (values: UserFormValues) => {
    try {
      // Map to backend payload
      const payload = {
        userName: values.nick, // adjust mapping if needed
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status === 'Enable' ? '0' : '1',
        deptId: values.dept ? 1 : undefined // map properly in your real API
      };
      await addUserApi(payload);
      message.success('User added');
      setOpenAdd(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      message.error('Add failed');
    }
  };

  const handleEdit = async (row: UserRow, values: UserFormValues) => {
    try {
      const payload = {
        userId: Number(row.id),
        userName: values.nick,
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status === 'Enable' ? '0' : '1',
        deptId: values.dept ? 1 : undefined
      };
      await updateUserApi(payload);
      message.success('User updated');
      setOpenEdit(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
      message.error('Update failed');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteUserApi({ userIds: selectedKeys.join(',') });
      message.success('Deleted');
      setSelectedKeys([]);
      fetchUsers();
    } catch (e) {
      console.error(e);
      message.error('Delete failed');
    }
  };

  const onModify = (row: UserRow) => setOpenEdit(row);
  const onDelete = async (row: UserRow) => {
    await deleteUserApi({ userIds: row.id });
    message.success('Deleted');
    fetchUsers();
  };
  const onToggleVisible = (row: UserRow) => {
    console.log('TOGGLE_VISIBLE (client-only)', row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
  };
  const onResetPass = (row: UserRow) => {
    console.log('RESET_PASSCODE (placeholder)', row.id);
  };
  const onAssignRole = (row: UserRow) => {
    console.log('ASSIGN_ROLE (placeholder)', row.id);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-5">User Lists</h1>

      <FilterBar
        filters={filters}
        onFilters={(f) => setFilters(f)}
        onReset={() => setFilters({ date: null, dept: null, status: null, keyword: '' })}
        selectedCount={selectedKeys.length}
        onAdd={() => setOpenAdd(true)}
        onDelete={handleDeleteSelected}
        onExport={() => console.log('EXPORT users (implement CSV if needed)')}
      />

      <UsersTable
        data={filtered}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys) => setSelectedKeys(keys) }}
        onModify={onModify}
        onDelete={onDelete}
        onToggleVisible={onToggleVisible}
        onResetPass={onResetPass}
        onAssignRole={onAssignRole}
      />

      {/* ADD */}
      <Modal title="Add User" open={openAdd} footer={null} onCancel={() => setOpenAdd(false)} destroyOnClose>
        <UserForm submitLabel="Add User" onSubmit={handleAdd} />
      </Modal>

      {/* EDIT */}
      <Modal title="Edit User" open={!!openEdit} footer={null} onCancel={() => setOpenEdit(null)} destroyOnClose>
        {openEdit && (
          <UserForm
            submitLabel="Save Changes"
            initial={{
              nick: openEdit.username,
              phone: openEdit.phone,
              email: '', // map if you fetch it
              dept: openEdit.department,
              status: openEdit.status === 'Enabled' ? 'Enable' : 'Disable'
            }}
            onSubmit={(v) => handleEdit(openEdit, v)}
          />
        )}
      </Modal>
    </main>
  );
};

export default UsersPage;
