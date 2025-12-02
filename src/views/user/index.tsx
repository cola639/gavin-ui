// page/user/index.tsx
import { uploadAvatar } from '@/apis/common';
import { getDeptApi } from '@/apis/dept';
import { addUserApi, deleteUserApi, getRolePost, getUsersApi, updateUserApi } from '@/apis/user';
import UserForm, { UserFormValues } from '@/components/form';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeptNode, findDeptIdByLabel, findDeptLabelById, toAntTreeData } from './depTypes';
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
  createTime: string;
  deptId?: number;
  deptName?: string;
};

const toRow = (u: ApiUser): UserRow => ({
  id: String(u.userId ?? ''),
  username: u.userName ?? '',
  email: u.email ?? '',
  avatar: '',
  department: u.deptName ?? '',
  phone: String(u.phonenumber ?? ''),
  status: u.status === '0' ? 'Enabled' : 'Disabled',
  createTime: u.createTime ?? '',
  visible: true
});

type Filters = {
  date?: string | null;
  dept?: string | null;
  status?: string | null;
  username?: string;
  phonenumber?: string;
};

type Option = { label: string; value: string };

const UsersPage: React.FC = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    date: null,
    dept: null,
    status: null,
    username: '',
    phonenumber: ''
  });

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | UserRow>(null);

  // dept tree
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);

  // NEW: role & post options from backend
  const [roleOptions, setRoleOptions] = useState<Option[]>([]);
  const [postOptions, setPostOptions] = useState<Option[]>([]);

  // ---- load department tree once ----
  useEffect(() => {
    (async () => {
      try {
        const res: any = await getDeptApi();
        const list: DeptNode[] = res?.data ?? [];
        setDeptTree(list);
        console.log('GET_DEPTS', list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ---- load roles / posts once ----
  useEffect(() => {
    (async () => {
      try {
        const res: any = await getRolePost();
        const roles = (res?.roles ?? []).filter((r: any) => r.status === '0' && r.delFlag !== '2');
        const posts = (res?.posts ?? []).filter((p: any) => p.status === '0');

        setRoleOptions(
          roles.map((r: any) => ({
            label: r.roleName,
            value: String(r.roleId)
          }))
        );

        setPostOptions(
          posts.map((p: any) => ({
            label: p.postName,
            value: String(p.postId)
          }))
        );

        console.log('GET_ROLE_POST', res);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const d = dayjs(filters.date);
      const params = {
        pageNum: 1,
        pageSize: 20,
        userName: filters.username || undefined,
        phonenumber: filters.phonenumber || undefined,
        deptName: filters.dept || undefined,
        status: filters.status === 'Enabled' ? '0' : filters.status === 'Disabled' ? '1' : undefined,
        createTime: d.isValid() ? d.startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined
      };
      const res: any = await getUsersApi(params);
      const list: ApiUser[] = res?.rows ?? [];
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

  // helpers
  const ci = (s?: string | null) => (s ?? '').toLowerCase();
  const digits = (s?: string | null) => (s ?? '').replace(/\D/g, '');

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filters.username && !ci(r.username).includes(ci(filters.username))) return false;
        if (filters.phonenumber && !digits(r.phone).includes(digits(filters.phonenumber))) return false;
        if (filters.dept && !ci(r.department).includes(ci(filters.dept))) return false;
        if (filters.status && r.status !== filters.status) return false;
        if (filters.date) {
          const dStr = r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD') : '';
          if (dStr !== filters.date) return false;
        }
        return true;
      }),
    [rows, filters]
  );

  const handleAdd = async (values: UserFormValues) => {
    try {
      let avatarUrl: string | null = values.avatar ?? null;

      // 1) if user picked a file, upload it first
      if (values.avatarFile) {
        const fd = new FormData();
        fd.append('file', values.avatarFile);

        const res: any = await uploadAvatar(fd);
        // based on your screenshot response
        avatarUrl = res.url || res.fileName || res.data?.url || null;
        console.log('UPLOAD_AVATAR_RESULT', res, 'chosenUrl=', avatarUrl);
      }

      // 2) now call user API with avatar url
      const payload = {
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status,
        sex: values.sex,
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleId: values.role ? Number(values.role) : undefined,
        postId: values.post ? Number(values.post) : undefined,
        avatar: avatarUrl ?? undefined,
        password: '123456' // default password for new user
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
      let avatarUrl: string | null = values.avatar ?? row.avatar ?? null;

      if (values.avatarFile) {
        const fd = new FormData();
        fd.append('file', values.avatarFile);
        const res: any = await uploadAvatar(fd);
        avatarUrl = res.url || res.fileName || res.data?.url || null;
      }

      const payload = {
        userId: Number(row.id),
        userName: values.nick,
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status === 'Enable' ? '0' : '1',
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleId: values.role ? Number(values.role) : undefined,
        postId: values.post ? Number(values.post) : undefined,
        avatar: avatarUrl ?? undefined
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
  const onResetPass = (row: UserRow) => console.log('RESET_PASSCODE (placeholder)', row.id);
  const onAssignRole = (row: UserRow) => console.log('ASSIGN_ROLE (placeholder)', row.id);

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-5">User Lists</h1>

      <FilterBar
        filters={filters}
        onFilters={setFilters}
        onReset={() => setFilters({ date: null, dept: null, status: null, username: '', phonenumber: '' })}
        selectedCount={selectedKeys.length}
        onAdd={() => setOpenAdd(true)}
        onDelete={handleDeleteSelected}
        onExport={() => console.log('EXPORT users (CSV to be added if needed)')}
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
      <Modal title="Add User" open={openAdd} footer={null} onCancel={() => setOpenAdd(false)}>
        <UserForm submitLabel="Add User" onSubmit={handleAdd} deptTree={deptTree} roles={roleOptions} posts={postOptions} />
      </Modal>

      {/* EDIT */}
      <Modal title="Edit User" open={!!openEdit} footer={null} onCancel={() => setOpenEdit(null)}>
        {openEdit && (
          <UserForm
            submitLabel="Save Changes"
            initial={{
              avatar: openEdit.avatar, // <— existing avatar url from row
              nick: openEdit.username,
              phone: openEdit.phone,
              email: openEdit.email ?? '',
              deptId: findDeptIdByLabel(deptTree, openEdit.department),
              status: openEdit.status === 'Enabled' ? 'Enable' : 'Disable'
            }}
            onSubmit={(v) => handleEdit(openEdit, v)}
            deptTree={deptTree}
            roles={roleOptions}
            posts={postOptions}
          />
        )}
      </Modal>
    </main>
  );
};

export default UsersPage;
