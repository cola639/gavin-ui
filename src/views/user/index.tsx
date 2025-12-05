// pages/user/index.tsx
import { uploadAvatarApi } from '@/apis/common';
import { getDeptApi } from '@/apis/dept';
import { exportExcelApi } from '@/apis/export';
import { addUserApi, deleteUserApi, getUserDetailApi, getUsersApi, updateUserApi } from '@/apis/user';
import UserForm, { UserFormValues } from '@/components/form';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import UsersTable from './Table';
import type { DeptNode } from './depTypes';
import type { UserRow } from './types';

// ---------- Types & helpers ----------

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

type Filters = {
  date?: string | null;
  dept?: string | null;
  status?: string | null;
  username?: string;
  phonenumber?: string;
};

type Option = { label: string; value: string };

const DEFAULT_FILTERS: Filters = {
  date: null,
  dept: null,
  status: null,
  username: '',
  phonenumber: ''
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

// map form radio value → backend string
const formStatusToApi = (status: UserFormValues['status']): 'Enabled' | 'Disabled' => (status === 'Enabled' ? 'Enabled' : 'Disabled');

const buildUserQueryParams = (filters: Filters) => {
  const d = filters.date ? dayjs(filters.date) : null;

  return {
    pageNum: 1,
    pageSize: 20,
    userName: filters.username || undefined,
    phonenumber: filters.phonenumber || undefined,
    deptName: filters.dept || undefined,
    status: filters.status || undefined,
    createTime: d && d.isValid() ? d.startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined
  };
};

/** Resolve final avatar URL: keep existing string or upload a new file if present. */
const resolveAvatarUrl = async (values: UserFormValues): Promise<string | null> => {
  let avatarUrl: string | null = values.avatar ?? null;
  const avatarFile = (values as any).avatarFile as File | undefined | null;

  if (avatarFile) {
    const fd = new FormData();
    fd.append('file', avatarFile);
    const res: any = await uploadAvatarApi(fd);
    avatarUrl = res.url || res.fileName || res.data?.url || null;
    console.log('UPLOAD_AVATAR_RESULT', res, 'chosenUrl=', avatarUrl);
  }

  return avatarUrl;
};

/** Normalize roles/posts payload from /system/user/info */
const extractRolePostOptions = (res: any): { roles: Option[]; posts: Option[] } => {
  const rawRoles = res?.roles ?? [];
  const rawPosts = res?.posts ?? [];

  const roles: Option[] = rawRoles
    .filter((r: any) => r.status === '0' && r.delFlag !== '2')
    .map((r: any) => ({
      label: r.roleName,
      value: String(r.roleId)
    }));

  const posts: Option[] = rawPosts
    .filter((p: any) => p.status === '0')
    .map((p: any) => ({
      label: p.postName,
      value: String(p.postId)
    }));

  return { roles, posts };
};

// ---------- Component ----------

const UsersPage: React.FC = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // ADD modal
  const [openAdd, setOpenAdd] = useState(false);

  // EDIT modal
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<UserFormValues> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // meta data
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);
  const [roleOptions, setRoleOptions] = useState<Option[]>([]);
  const [postOptions, setPostOptions] = useState<Option[]>([]);

  // ---------- bootstrap dept tree once ----------

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res: any = await getDeptApi();
        setDeptTree(res?.data ?? []);
        console.log('GET_DEPTS', res?.data);
      } catch (e) {
        console.error(e);
      }
    };

    loadDepts();
  }, []);

  // ---------- table data loading (always from backend, no local filtering) ----------

  const fetchUsers = async (targetFilters: Filters = filters) => {
    setLoading(true);
    try {
      const params = buildUserQueryParams(targetFilters);
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
  };

  // first load, with default filters
  useEffect(() => {
    fetchUsers(DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    fetchUsers(next); // exactly one request per change
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    fetchUsers(DEFAULT_FILTERS);
  };

  // ---------- role/post loader used by both ADD and EDIT ----------

  const loadRolePostMeta = async (userId?: number) => {
    const res: any = await getUserDetailApi(userId);
    const { roles, posts } = extractRolePostOptions(res);
    setRoleOptions(roles);
    setPostOptions(posts);
    return res;
  };

  // ---------- CRUD handlers ----------

  // ADD: open modal, then load roles/posts meta without userId
  const handleOpenAdd = async () => {
    setOpenAdd(true);
    try {
      await loadRolePostMeta(); // no userId → backend returns global roles/posts
    } catch (e) {
      console.error(e);
      message.error('Failed to load role/post options');
    }
  };

  const handleAdd = async (values: UserFormValues) => {
    try {
      const avatarUrl = await resolveAvatarUrl(values);

      const payload = {
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: formStatusToApi(values.status),
        sex: values.sex,
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleIds: values.role ? [Number(values.role)] : [],
        postIds: values.post ? [Number(values.post)] : [],
        avatar: avatarUrl ?? undefined,
        password: '123456' // default password for new user
      };

      await addUserApi(payload);
      message.success('User added');
      setOpenAdd(false);
      fetchUsers(); // use current filters
    } catch (e) {
      console.error(e);
      message.error('Add failed');
    }
  };

  const handleEdit = async (userId: number, values: UserFormValues) => {
    try {
      const avatarUrl = await resolveAvatarUrl(values);

      const payload = {
        userId,
        nickName: values.nick,
        email: values.email,
        phonenumber: values.phone,
        status: formStatusToApi(values.status),
        sex: values.sex,
        deptId: values.deptId ? Number(values.deptId) : undefined,
        roleIds: values.role ? [Number(values.role)] : [],
        postIds: values.post ? [Number(values.post)] : [],
        avatar: avatarUrl ?? undefined
      };

      await updateUserApi(payload);
      message.success('User updated');
      setEditUserId(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
      message.error('Update failed');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteUserApi(selectedKeys);
      message.success('Deleted');
      setSelectedKeys([]);
      fetchUsers();
    } catch (e) {
      console.error(e);
      message.error('Delete failed');
    }
  };

  const handleExport = async () => {
    const criteria = buildUserQueryParams(filters);
    await exportExcelApi('/system/user/export', 'users.xlsx', criteria);
  };

  // ---------- row actions ----------

  // EDIT: pass current row userId → get roles, posts AND user info
  const openEditModal = async (row: UserRow) => {
    const userId = Number(row.id);
    setEditUserId(userId);
    setEditLoading(true);
    setEditInitial(null);

    try {
      const res = await loadRolePostMeta(userId); // userId passed here
      const u = (res as any)?.data;
      if (!u) {
        message.error('User not found');
        setEditUserId(null);
        return;
      }

      const roleIds: number[] = (res as any)?.roleIds ?? [];
      const postIds: number[] = (res as any)?.postIds ?? [];

      setEditInitial({
        avatar: u.avatar ?? null,
        nick: u.nickName ?? '',
        phone: u.phonenumber ?? '',
        email: u.email ?? '',
        deptId: u.deptId ? String(u.deptId) : undefined,
        post: postIds[0] != null ? String(postIds[0]) : '',
        role: roleIds[0] != null ? String(roleIds[0]) : '',
        sex: u.sex ?? '',
        status: u.status === 'Enabled' ? 'Enabled' : 'Disabled'
      });
    } catch (e) {
      console.error(e);
      message.error('Failed to load user detail');
      setEditUserId(null);
    } finally {
      setEditLoading(false);
    }
  };

  const onDeleteRow = (row: UserRow) => {
    Modal.confirm({
      title: 'Delete this user?',
      content: `Are you sure you want to delete "${row.username}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      async onOk() {
        try {
          await deleteUserApi(row.id);
          message.success('Deleted');
          fetchUsers();
        } catch (e) {
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onToggleVisible = (row: UserRow) => {
    console.log('TOGGLE_VISIBLE (client-only)', row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
  };

  const onResetPass = (row: UserRow) => console.log('RESET_PASSCODE (placeholder)', row.id);
  const onAssignRole = (row: UserRow) => console.log('ASSIGN_ROLE (placeholder)', row.id);

  // ---------- render ----------

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">User Lists</h1>

      <FilterBar
        filters={filters}
        onFilters={handleFiltersChange}
        onReset={handleResetFilters}
        selectedCount={selectedKeys.length}
        onAdd={handleOpenAdd}
        onDelete={handleDeleteSelected}
        onExport={handleExport}
      />

      <UsersTable
        data={rows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys) => setSelectedKeys(keys) }}
        onModify={openEditModal}
        onDelete={onDeleteRow}
        onToggleVisible={onToggleVisible}
        onResetPass={onResetPass}
        onAssignRole={onAssignRole}
        loading={loading}
      />

      {/* ADD */}
      <Modal title="Add User" open={openAdd} footer={null} onCancel={() => setOpenAdd(false)} destroyOnClose>
        <UserForm submitLabel="Add User" onSubmit={handleAdd} deptTree={deptTree} roles={roleOptions} posts={postOptions} />
      </Modal>

      {/* EDIT */}
      <Modal title="Edit User" open={editUserId !== null} footer={null} onCancel={() => setEditUserId(null)} destroyOnClose>
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
