// pages/user/index.tsx
import { uploadAvatar } from '@/apis/common';
import { getDeptApi } from '@/apis/dept';
import { addUserApi, deleteUserApi, getUserDetailApi, getUsersApi, updateUserApi } from '@/apis/user';
import UserForm, { UserFormValues } from '@/components/form';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeptNode } from './depTypes';
import FilterBar from './FilterBar';
import UsersTable from './Table';
import { UserRow } from './types';

type ApiUser = {
  userId: number;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  status: 'Enabled' | 'Disabled';
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
  status: u.status,
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

  // ------ EDIT modal state: only userId + fetched initial data ------
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<UserFormValues> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // dept tree
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);

  // role & post options from backend
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
        const res: any = await getUserDetailApi();
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

  // ---- load user list (table) ----
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const d = dayjs(filters.date as string | null);
      const params = {
        pageNum: 1,
        pageSize: 20,
        userName: filters.username || undefined,
        phonenumber: filters.phonenumber || undefined,
        deptName: filters.dept || undefined,
        status: filters.status || undefined,
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

  // ---- fetch single user detail for EDIT modal ----
  useEffect(() => {
    if (editUserId == null) {
      setEditInitial(null);
      return;
    }

    (async () => {
      try {
        setEditLoading(true);
        const res: any = await getUserDetailApi(editUserId);
        const u = res?.data;
        if (!u) {
          message.error('User not found');
          setEditUserId(null);
          return;
        }

        // adapt these fields to your actual backend response
        setEditInitial({
          avatar: u.avatar ?? null,
          nick: u.nickName ?? '',
          phone: u.phonenumber ?? '',
          email: u.email ?? '',
          deptId: u.deptId ? String(u.deptId) : undefined,
          post: u.postId ? String(u.postId) : '',
          role: u.roleId ? String(u.roleId) : '',
          sex: u.sex ?? '',
          status: u.status === 'Enabled' ? 'Enable' : 'Disable'
        });
      } catch (e) {
        console.error(e);
        message.error('Failed to load user detail');
        setEditUserId(null);
      } finally {
        setEditLoading(false);
      }
    })();
  }, [editUserId]);

  // helpers for client-side filter
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

  // ---- handlers ----

  const handleAdd = async (values: UserFormValues) => {
    try {
      let avatarUrl: string | null = values.avatar ?? null;

      // upload avatar file if chosen
      if (values.avatarFile) {
        const fd = new FormData();
        fd.append('file', values.avatarFile);

        const res: any = await uploadAvatar(fd);
        avatarUrl = res.url || res.fileName || res.data?.url || null;
        console.log('UPLOAD_AVATAR_RESULT', res, 'chosenUrl=', avatarUrl);
      }

      const payload = {
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status,
        sex: values.sex,
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleIds: values.role ? [Number(values.role)] : undefined,
        postIds: values.post ? [Number(values.post)] : undefined,
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

  const handleEdit = async (userId: number, values: UserFormValues) => {
    try {
      let avatarUrl: string | null = values.avatar ?? null;

      if (values.avatarFile) {
        const fd = new FormData();
        fd.append('file', values.avatarFile);
        const res: any = await uploadAvatar(fd);
        avatarUrl = res.url || res.fileName || res.data?.url || null;
      }

      const payload = {
        userId,
        userName: values.nick,
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: values.status === 'Enable' ? '0' : '1', // adjust if backend expects Enabled/Disabled
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleId: values.role ? Number(values.role) : undefined,
        postId: values.post ? Number(values.post) : undefined,
        avatar: avatarUrl ?? undefined
      };

      await updateUserApi(payload);
      message.success('User updated');
      setEditUserId(null); // close modal
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

  // row actions
  const onModify = (row: UserRow) => {
    setEditUserId(Number(row.id)); // only pass id, detail will be fetched
  };

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
      <Modal title="Edit User" open={editUserId !== null} footer={null} onCancel={() => setEditUserId(null)}>
        {editLoading && <div style={{ padding: 16 }}>Loading...</div>}

        {!editLoading && editUserId !== null && editInitial && (
          <UserForm
            submitLabel="Save Changes"
            initial={editInitial}
            onSubmit={(v) => handleEdit(editUserId, v)}
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
