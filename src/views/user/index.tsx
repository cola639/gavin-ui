import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import FilterBar from './FilterBar';
import UsersTable from './Table';
import { USERS } from './data';
import { UserRow } from './types';

const UsersPage: React.FC = () => {
  // source of truth
  const [rows, setRows] = useState<UserRow[]>(USERS);

  // filters state (single direction data flow)
  const [filters, setFilters] = useState<{ date?: string | null; dept?: string | null; status?: string | null; keyword?: string }>({
    date: null,
    dept: null,
    status: null,
    keyword: ''
  });

  // selection
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // derived list
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.date && dayjs(r.createTime).format('YYYY-MM-DD') !== filters.date) return false;
      if (filters.dept && r.department !== filters.dept) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.keyword && !(r.username.includes(filters.keyword) || r.phone.includes(filters.keyword))) return false;
      return true;
    });
  }, [rows, filters]);

  // actions
  const handleAdd = () => console.log('ADD_USER_CLICK');
  const handleDeleteSelected = () => {
    console.log('DELETE_SELECTED', selectedKeys);
    setRows((prev) => prev.filter((r) => !selectedKeys.includes(r.id)));
    setSelectedKeys([]);
  };
  const handleExport = () => {
    const header = ['ID', 'USERNAME', 'DEPARTMENT', 'PHONE', 'STATUS', 'CREATETIME'];
    const body = filtered.map((r) => [r.id, r.username, r.department, r.phone, r.status, r.createTime]);
    const csv = [header, ...body].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // row handlers
  const onModify = (row: UserRow) => console.log('MODIFY_USER', row);
  const onDelete = (row: UserRow) => {
    console.log('DELETE_USER', row.id);
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };
  const onToggleVisible = (row: UserRow) => {
    console.log('TOGGLE_VISIBLE', row.id);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
  };
  const onResetPass = (row: UserRow) => console.log('RESET_PASSCODE', row.id);
  const onAssignRole = (row: UserRow) => console.log('ASSIGN_ROLE', row.id);

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-5">User Lists</h1>

      <FilterBar
        filters={filters}
        onFilters={setFilters}
        onReset={() => setFilters({ date: null, dept: null, status: null, keyword: '' })}
        selectedCount={selectedKeys.length}
        onAdd={handleAdd}
        onDelete={handleDeleteSelected}
        onExport={handleExport}
      />

      <UsersTable
        data={filtered}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys)
        }}
        onModify={onModify}
        onDelete={onDelete}
        onToggleVisible={onToggleVisible}
        onResetPass={onResetPass}
        onAssignRole={onAssignRole}
      />
    </main>
  );
};

export default UsersPage;
