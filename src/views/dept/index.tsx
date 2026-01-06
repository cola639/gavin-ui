// src/views/dept/index.tsx
import type { DeptStatus, DeptTreeApiNode } from '@/apis/dept';
import { deleteDeptApi, getDeptTreeApi } from '@/apis/dept';
import { Modal, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DeptLayout from './DeptLayout';
import DeptModal from './DeptModal';
import DeptTree, { type DeptNode } from './DeptTree';

type Filters = { deptName: string; status: DeptStatus | null };
const DEFAULT: Filters = { deptName: '', status: null };

// ✅ build UI tree directly from /dept/list (no more /dept/{id} loop)
const mapTree = (nodes: DeptTreeApiNode[] = [], parent?: { id: number; ancestors: string }): DeptNode[] => {
  return nodes.map((n) => {
    const id = Number(n.id);
    const ancestors = parent ? `${parent.ancestors},${parent.id}` : '0';

    // If your backend uses `disabled` to indicate inactive, map it.
    // (If later your /list returns real status, just switch to that.)
    const status: DeptStatus = n.disabled ? 'Disabled' : 'Enabled';

    return {
      id,
      name: n.label ?? '',
      disabled: !!n.disabled,
      status,
      createTime: n.createTime,
      ancestors,
      children: n.children?.length ? mapTree(n.children, { id, ancestors }) : []
    };
  });
};

const DeptPage: React.FC = () => {
  // ✅ draft = what user is typing, applied = what we actually query
  const [draft, setDraft] = useState<Filters>(DEFAULT);
  const [applied, setApplied] = useState<Filters>(DEFAULT);

  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<DeptNode[]>([]);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalDeptId, setModalDeptId] = useState<number | null>(null);
  const [modalParent, setModalParent] = useState<{ deptId: number; deptName: string; ancestors: string } | null>(null);

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const query = useMemo(
    () => ({
      deptName: applied.deptName.trim() || undefined,
      status: applied.status ?? undefined
    }),
    [applied.deptName, applied.status]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getDeptTreeApi(query);
      const data: DeptTreeApiNode[] = res?.data?.data ?? res?.data ?? res?.data?.data?.data ?? [];
      if (!aliveRef.current) return;

      setTree(mapTree(data)); // ✅ single call only
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Failed to load depts');
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [query]);

  // ✅ only runs when `applied` changes (Search/Reset)
  useEffect(() => {
    load();
  }, [load]);

  const onSearch = () => setApplied(draft);

  const onReset = () => {
    setDraft(DEFAULT);
    setApplied(DEFAULT); // ✅ no setTimeout(load) => no double fetch
  };

  const onNewRoot = () => {
    setModalMode('create');
    setModalDeptId(null);
    setModalParent(null);
    setModalOpen(true);
  };

  const onAddChild = (parent: DeptNode) => {
    // ✅ no getDeptApi here; we already have ancestors from mapTree
    setModalMode('create');
    setModalDeptId(null);
    setModalParent({ deptId: parent.id, deptName: parent.name, ancestors: parent.ancestors ?? '0' });
    setModalOpen(true);
  };

  const onEdit = (node: DeptNode) => {
    setModalMode('edit');
    setModalDeptId(node.id);
    setModalParent(null);
    setModalOpen(true);
  };

  const onDelete = (node: DeptNode) => {
    Modal.confirm({
      title: 'Delete this dept?',
      content: `Are you sure you want to delete "${node.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteDeptApi(node.id);
          message.success('Deleted');
          load();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  return (
    <main className="">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Dept</h1>

      <DeptLayout
        deptName={draft.deptName}
        status={draft.status}
        onDeptNameChange={(v) => setDraft((p) => ({ ...p, deptName: v }))}
        onStatusChange={(v) => setDraft((p) => ({ ...p, status: v }))}
        onSearch={onSearch}
        onReset={onReset}
        onNew={onNewRoot}
      >
        <div className="relative">
          {loading ? <div className="mb-2 text-sm text-gray-500">Loading...</div> : null}
          <DeptTree data={tree} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </DeptLayout>

      <DeptModal
        open={modalOpen}
        mode={modalMode}
        deptId={modalDeptId}
        parent={modalParent}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          load();
        }}
      />
    </main>
  );
};

export default DeptPage;
