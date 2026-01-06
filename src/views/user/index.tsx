// src/views/user/index.tsx
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { getMinioImageSrc, uploadAvatarApi } from '@/apis/common';
import { getDeptTreeApi } from '@/apis/dept';
import { exportExcelApi } from '@/apis/export';
import { addUserApi, deleteUserApi, getUserDetailApi, getUsersApi, updateUserApi } from '@/apis/user';

import UserForm, { UserFormValues } from '@/views/user/UserForm';
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
  avatar: string; // ✅ now we prefer storing URL, but old data may still be fileId
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

// ---------- Avatar helpers ----------

// old data compatibility: "6" or "/minio/image/6" or "http://.../minio/image/6"
const isNumericId = (v: any) => typeof v === 'string' && /^\d+$/.test(v.trim());

const extractAvatarId = (avatar?: string | null): string | null => {
  if (!avatar) return null;
  const s = String(avatar).trim();
  if (!s) return null;

  if (isNumericId(s)) return s;

  const m = s.match(/\/minio\/image\/(\d+)/);
  if (m?.[1]) return m[1];

  return null;
};

/**
 * For UI display:
 * - if avatar is an absolute URL => use it
 * - if avatar is /minio/image/... => use it
 * - if avatar is numeric => treat as fileId and render via /minio/image/{id}
 */
const toAvatarSrc = (avatar?: string | null): string => {
  if (!avatar) return '';
  const s = String(avatar).trim();
  if (!s) return '';

  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/minio/image/')) return s;

  const id = extractAvatarId(s);
  return id ? getMinioImageSrc(id) : s;
};

/**
 * ✅ Upload avatar to MinIO and return the URL to store in backend "avatar" field.
 * Backend response example:
 *   { code: 200, data: { fileId: 7, url: "https://minio...jpg" } }
 *
 * We store ONLY url (not fileId).
 */
const resolveAvatarUrl = async (values: UserFormValues, bizId?: number): Promise<string | null> => {
  // support both fields: avatarFile (preferred) or avatar (if your form passes File there)
  const avatarFile =
    ((values as any).avatarFile as File | undefined | null) ||
    (((values as any).avatar as any) instanceof File ? ((values as any).avatar as any as File) : null);

  // ✅ New upload
  if (avatarFile) {
    const fd = new FormData();
    fd.append('category', 'AVATAR');
    fd.append('bizType', 'USER');
    fd.append('bizId', String(bizId ?? 0));
    fd.append('file', avatarFile);

    const res: any = await uploadAvatarApi(fd);

    // prefer MinIO public url
    const url = res?.data?.url || res?.data?.data?.url || res?.url || res?.data?.data?.data?.url || '';

    if (!url) {
      // fallback (if backend didn’t return url for some reason)
      // NOTE: we still do NOT store fileId; we just keep existing avatar if present
      console.warn('Upload success but url missing:', res);
      return values.avatar ? String(values.avatar) : null;
    }

    return String(url);
  }

  // ✅ No upload: keep existing avatar string (already URL or old fileId)
  return values.avatar ? String(values.avatar) : null;
};

const toRow = (u: ApiUser): UserRow => ({
  id: String(u.userId ?? ''),
  username: u.userName ?? '',
  email: u.email ?? '',
  avatar: toAvatarSrc(u.avatar ?? ''),
  department: u.deptName ?? '',
  phone: String(u.phonenumber ?? ''),
  status: u.status,
  createTime: u.createTime ?? '',
  visible: true
});

// map form radio value → backend string
const formStatusToApi = (status: UserFormValues['status']): 'Enabled' | 'Disabled' => (status === 'Enabled' ? 'Enabled' : 'Disabled');

const buildUserQueryParams = (filters: Filters, pageNum: number, pageSize: number) => {
  const d = filters.date ? dayjs(filters.date) : null;

  return {
    pageNum,
    pageSize,
    userName: filters.username || undefined,
    phonenumber: filters.phonenumber || undefined,
    deptName: filters.dept || undefined,
    status: filters.status || undefined,
    createTime: d && d.isValid() ? d.startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined
  };
};

/** Normalize roles/posts payload from /system/user/info */
const extractRolePostOptions = (res: any): { roles: Option[]; posts: Option[] } => {
  const rawRoles = res?.roles ?? [];
  const rawPosts = res?.posts ?? [];

  const roles: Option[] = rawRoles
    .filter((r: any) => r.status !== 'Deleted' && r.delFlag === 'Normal')
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

  // pagination (server-side)
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

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
        const res: any = await getDeptTreeApi();
        setDeptTree(res?.data ?? []);
      } catch (e) {
        console.error(e);
      }
    };

    loadDepts();
  }, []);

  // ---------- table data loading ----------

  const fetchUsers = async (opts?: { pageNum?: number; pageSize?: number; filters?: Filters }) => {
    const nextPageNum = opts?.pageNum ?? pageNum;
    const nextPageSize = opts?.pageSize ?? pageSize;
    const nextFilters = opts?.filters ?? filters;

    setLoading(true);
    try {
      const params = buildUserQueryParams(nextFilters, nextPageNum, nextPageSize);
      const res: any = await getUsersApi(params);
      const list: ApiUser[] = res?.rows ?? [];

      setRows(list.map(toRow));
      setPageNum(nextPageNum);
      setPageSize(nextPageSize);
      setTotal(Number(res?.total ?? list.length));
    } catch (e) {
      console.error(e);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({ pageNum: 1, pageSize, filters: DEFAULT_FILTERS });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    fetchUsers({ pageNum: 1, filters: next });
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    fetchUsers({ pageNum: 1, filters: DEFAULT_FILTERS });
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    fetchUsers({ pageNum: nextPage, pageSize: nextPageSize });
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

  const handleOpenAdd = async () => {
    setOpenAdd(true);
    try {
      await loadRolePostMeta();
    } catch (e) {
      console.error(e);
      message.error('Failed to load role/post options');
    }
  };

  const handleAdd = async (values: UserFormValues) => {
    try {
      // ✅ store URL only
      const avatarUrl = await resolveAvatarUrl(values, 0);

      const payload = {
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
      // ✅ store URL only
      const avatarUrl = await resolveAvatarUrl(values, userId);

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
    const criteria = buildUserQueryParams(filters, pageNum, pageSize);
    await exportExcelApi('/system/user/export', 'users.xlsx', criteria);
  };

  // ---------- row actions ----------

  const openEditModal = async (row: UserRow) => {
    const userId = Number(row.id);
    setEditUserId(userId);
    setEditLoading(true);
    setEditInitial(null);

    try {
      const res: any = await loadRolePostMeta(userId);
      const u = res?.data;
      if (!u) {
        message.error('User not found');
        setEditUserId(null);
        return;
      }

      const roleIds: number[] = res?.roleIds ?? [];
      const postIds: number[] = res?.postIds ?? [];

      setEditInitial({
        // ✅ show avatar correctly for both URL and legacy fileId
        avatar: toAvatarSrc(u.avatar ?? null),
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
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
  };

  const onResetPass = (row: UserRow) => console.log('RESET_PASSCODE (placeholder)', row.id);
  const onAssignRole = (row: UserRow) => console.log('ASSIGN_ROLE (placeholder)', row.id);

  // ---------- render ----------

  return (
    <main className="">
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
        loading={loading}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys) => setSelectedKeys(keys) }}
        onModify={openEditModal}
        onDelete={onDeleteRow}
        onToggleVisible={onToggleVisible}
        onResetPass={onResetPass}
        onAssignRole={onAssignRole}
        pagination={{ current: pageNum, pageSize, total }}
        onChangePage={handlePageChange}
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
