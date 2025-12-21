import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import RoleFilterBar, { RoleFilters } from './FilterBar';
import RolesTable from './Table';
import type { RoleRow } from './type';

import AssignUsersModal from './AssignUsersModal';
import RoleForm, { RoleFormValues } from './RoleForm';

import { addRoleApi, deleteRoleApi, getRolesApi, updateRoleApi, type ApiRoleRow } from '@/apis/role';

const DEFAULT_FILTERS: RoleFilters = { roleName: '', status: null };

const toRow = (r: ApiRoleRow): RoleRow => ({
  id: String(r.roleId),
  roleName: r.roleName ?? '',
  roleKey: r.roleKey ?? '',
  roleSort: Number(r.roleSort ?? 0),
  status: r.status,
  createTime: r.createTime ?? '',
  remark: r.remark
});

const RolesPage: React.FC = () => {
  const [filters, setFilters] = useState<RoleFilters>(DEFAULT_FILTERS);

  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // ✅ force refetch even if pageNum/filters didn't change (e.g. pageNum already 1)
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  // add/edit
  const [openAdd, setOpenAdd] = useState(false);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<RoleFormValues> | null>(null);

  // assign users
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [assignRoleName, setAssignRoleName] = useState<string | undefined>(undefined);

  // debounce + only accept last response
  const reqSeq = useRef(0);

  const query = useMemo(
    () => ({
      pageNum,
      pageSize,
      roleName: filters.roleName?.trim() || undefined,
      status: filters.status ?? undefined
    }),
    [filters.roleName, filters.status, pageNum]
  );

  // ✅ auto fetch when filters/page changes OR refreshKey changes
  useEffect(() => {
    const seq = ++reqSeq.current;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res: any = await getRolesApi(query);

        if (seq !== reqSeq.current) return;

        const list: ApiRoleRow[] = res?.rows ?? res?.data?.rows ?? [];
        setRows(list.map(toRow));
        setTotal(Number(res?.total ?? res?.data?.total ?? list.length));

        // match user-table behavior: clear selection after refresh
        setSelectedKeys([]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('Failed to load roles');
      } finally {
        if (seq === reqSeq.current) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, refreshKey]);

  // filters change -> go page 1 (effect will run because filters changed)
  const handleFilters = (next: RoleFilters) => {
    setFilters(next);
    setPageNum(1);
  };

  // ✅ reset should ALWAYS refetch
  const onReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPageNum(1);
    setSelectedKeys([]);
    bumpRefresh();
  };

  const onAdd = () => setOpenAdd(true);

  const onDeleteSelected = () => {
    Modal.confirm({
      title: 'Delete selected roles?',
      content: `Are you sure you want to delete ${selectedKeys.length} role(s)?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteRoleApi(selectedKeys as any);
          message.success('Deleted');

          setPageNum(1);
          bumpRefresh(); // ✅ always refetch
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onDeleteRow = (row: RoleRow) => {
    Modal.confirm({
      title: 'Delete this role?',
      content: `Are you sure you want to delete "${row.roleName}"?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteRoleApi([Number(row.id)] as any);
          message.success('Deleted');

          setPageNum(1);
          bumpRefresh(); // ✅ always refetch
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onModify = (row: RoleRow) => {
    setEditRoleId(Number(row.id));
    setEditInitial({
      roleName: row.roleName,
      roleKey: row.roleKey,
      status: row.status,
      remark: row.remark ?? '',
      // menuIds will be loaded by RoleForm(roleId=xxx) via roleMenuTreeselect
      menuIds: []
    });
  };

  const onAssignUser = (row: RoleRow) => {
    setAssignRoleId(Number(row.id));
    setAssignRoleName(row.roleName);
    setAssignOpen(true);
  };

  const handleAddSubmit = async (values: RoleFormValues) => {
    try {
      await addRoleApi({
        roleName: values.roleName,
        roleKey: values.roleKey,
        status: values.status, // "Enabled" | "Disabled"
        roleSort: 0,
        menuIds: values.menuIds,
        remark: values.remark
      } as any);

      message.success('Role added');
      setOpenAdd(false);

      setPageNum(1);
      bumpRefresh(); // ✅ refetch
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Add failed');
    }
  };

  const handleEditSubmit = async (v: RoleFormValues) => {
    if (!editRoleId) return;
    try {
      await updateRoleApi({
        roleId: editRoleId,
        roleName: v.roleName,
        roleKey: v.roleKey,
        status: v.status, // "Enabled" | "Disabled"
        roleSort: 0,
        menuIds: v.menuIds,
        remark: v.remark
      } as any);

      message.success('Role updated');
      setEditRoleId(null);
      setEditInitial(null);

      setPageNum(1);
      bumpRefresh(); // ✅ refetch
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Update failed');
    }
  };

  return (
    <main className="bg-[var(--bg-page)]">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Role Lists</h1>

      <RoleFilterBar
        filters={filters}
        onFilters={handleFilters}
        onReset={onReset}
        selectedCount={selectedKeys.length}
        onAdd={onAdd}
        onDelete={onDeleteSelected}
      />

      <RolesTable
        data={rows}
        loading={loading}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys) => setSelectedKeys(keys) }}
        onModify={onModify}
        onDelete={onDeleteRow}
        onAssignUser={onAssignUser}
        pagination={{ current: pageNum, pageSize, total }}
        onChangePage={(p) => setPageNum(p)}
      />

      {/* ADD */}
      <Modal title="Add Role" open={openAdd} footer={null} onCancel={() => setOpenAdd(false)} destroyOnClose>
        <RoleForm submitLabel="Add Role" onSubmit={handleAddSubmit} />
      </Modal>

      {/* EDIT */}
      <Modal
        title="Edit Role"
        open={editRoleId !== null}
        footer={null}
        onCancel={() => {
          setEditRoleId(null);
          setEditInitial(null);
        }}
        destroyOnClose
      >
        {editRoleId !== null && editInitial && (
          <RoleForm roleId={editRoleId} submitLabel="Save Changes" initial={editInitial} onSubmit={handleEditSubmit} />
        )}
      </Modal>

      {/* ASSIGN USERS */}
      <AssignUsersModal
        open={assignOpen}
        roleId={assignRoleId}
        roleName={assignRoleName}
        onClose={() => {
          setAssignOpen(false);
          setAssignRoleId(null);
          setAssignRoleName(undefined);
        }}
      />
    </main>
  );
};

export default RolesPage;
