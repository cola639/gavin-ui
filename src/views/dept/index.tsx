// src/views/dept/index.tsx
import { Modal, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DeptLayout from './DeptLayout';
import DeptModal from './DeptModal';
import DeptTree, { type DeptNode } from './DeptTree';

import { deleteDeptApi, getDeptApi, getDeptTreeApi, normalizeDeptStatus, type DeptDetail, type DeptStatus, type DeptTreeApiNode } from '@/apis/dept';

type Filters = { deptName: string; status: DeptStatus | null };

const DEFAULT: Filters = { deptName: '', status: null };

const mapTree = (nodes: DeptTreeApiNode[]): DeptNode[] =>
  (nodes ?? []).map((n) => ({
    id: Number(n.id),
    name: n.label ?? '',
    disabled: !!n.disabled,
    children: n.children?.length ? mapTree(n.children) : undefined
  }));

const flattenIds = (nodes: DeptNode[], acc: number[] = []) => {
  for (const n of nodes) {
    acc.push(n.id);
    if (n.children?.length) flattenIds(n.children, acc);
  }
  return acc;
};

async function pool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const ret: Promise<R>[] = [];
  const executing: Promise<any>[] = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => worker(item));
    ret.push(p);

    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);

    if (executing.length >= limit) await Promise.race(executing);
  }
  return Promise.allSettled(ret);
}

const mergeDetails = (tree: DeptNode[], detailMap: Map<number, DeptDetail>): DeptNode[] =>
  tree.map((n) => {
    const d = detailMap.get(n.id);
    return {
      ...n,
      status: d ? normalizeDeptStatus(d.status) : n.status,
      createTime: d?.createTime ?? n.createTime,
      children: n.children?.length ? mergeDetails(n.children, detailMap) : n.children
    };
  });

const DeptPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(DEFAULT);
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
      deptName: filters.deptName.trim() || undefined,
      status: filters.status ?? undefined
    }),
    [filters.deptName, filters.status]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getDeptTreeApi(query);
      const data: DeptTreeApiNode[] = res?.data?.data ?? res?.data ?? res?.data?.data?.data ?? [];
      const base = mapTree(data);
      if (!aliveRef.current) return;

      // fetch details for status/createTime (because list is treeselect-style)
      const ids = flattenIds(base, []);
      const detailMap = new Map<number, DeptDetail>();

      const results = await pool(ids, 6, async (id) => {
        const r: any = await getDeptApi(id);
        const d: DeptDetail = r?.data?.data ?? r?.data ?? r?.data?.data?.data ?? r?.data?.data;
        if (d?.deptId) detailMap.set(Number(d.deptId), d);
        return true as const;
      });

      // ignore failures, still render
      void results;

      setTree(mergeDetails(base, detailMap));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Failed to load depts');
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = () => load();

  const onReset = async () => {
    setFilters(DEFAULT);
    // ensure refresh after reset
    setTimeout(() => load(), 0);
  };

  const onNewRoot = () => {
    setModalMode('create');
    setModalDeptId(null);
    setModalParent(null);
    setModalOpen(true);
  };

  const onAddChild = async (parent: DeptNode) => {
    try {
      const res: any = await getDeptApi(parent.id);
      const d: DeptDetail = res?.data?.data ?? res?.data ?? res?.data?.data?.data ?? res?.data?.data;
      setModalMode('create');
      setModalDeptId(null);
      setModalParent({ deptId: d.deptId, deptName: d.deptName, ancestors: d.ancestors });
      setModalOpen(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error('Failed to load parent dept');
    }
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
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Dept</h1>

      <DeptLayout
        deptName={filters.deptName}
        status={filters.status}
        onDeptNameChange={(v) => setFilters((p) => ({ ...p, deptName: v }))}
        onStatusChange={(v) => setFilters((p) => ({ ...p, status: v }))}
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
