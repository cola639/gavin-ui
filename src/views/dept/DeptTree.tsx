// src/views/dept/DeptTree.tsx
import type { DeptStatus } from '@/apis/dept';
import IconTextButton from '@/components/button/IconTextButton';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './DeptTree.module.scss';

export type DeptNode = {
  id: number;
  name: string;
  disabled?: boolean;

  status?: DeptStatus;
  createTime?: string;

  children?: DeptNode[];
};

type Props = {
  data?: DeptNode[];
  onAddChild: (parent: DeptNode) => void;
  onEdit: (node: DeptNode) => void;
  onDelete: (node: DeptNode) => void;
};

const DeptTree: React.FC<Props> = ({ data = [], onAddChild, onEdit, onDelete }) => {
  const [tree, setTree] = useState<DeptNode[]>(data);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  useEffect(() => setTree(data), [data]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderStatus = (s?: DeptStatus) => {
    if (!s || s === 'Enabled') return <span className={`${styles.statusBadge} ${styles.statusEnabled}`}>Enabled</span>;
    return <span className={`${styles.statusBadge} ${styles.statusDisabled}`}>Disabled</span>;
  };

  const renderNode = (node: DeptNode, depth: number): React.ReactNode => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expanded.has(node.id);

    return (
      <React.Fragment key={node.id}>
        <div className={styles.row}>
          {/* Name */}
          <div className={styles.colName}>
            <div className={styles.colNameInner}>
              <div className={styles.indent} style={{ width: depth * 18 }} />

              {hasChildren ? (
                <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className={styles.expandPlaceholder} />
              )}

              <span className={styles.name}>{node.name}</span>
            </div>
          </div>

          {/* Status */}
          <div className={styles.colStatus}>{renderStatus(node.status)}</div>

          {/* Create Time */}
          <div className={styles.colTime}>{node.createTime || '-'}</div>

          {/* Action */}
          <div className={styles.colAction}>
            <IconTextButton className="!min-w-[40px]" icon={<Plus size={14} />} size="small" onClick={() => onAddChild(node)} />
            <IconTextButton className="!min-w-[40px]" icon={<Pencil size={14} />} size="small" onClick={() => onEdit(node)} />
            <IconTextButton className="!min-w-[40px]" icon={<Trash2 size={14} />} size="small" danger onClick={() => onDelete(node)} />
          </div>
        </div>

        {hasChildren && isExpanded ? node.children!.map((c) => renderNode(c, depth + 1)) : null}
      </React.Fragment>
    );
  };

  const header = useMemo(
    () => (
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerColName}>Dept Name</div>
          <div className={styles.headerColStatus}>Status</div>
          <div className={styles.headerColTime}>Create Time</div>
          <div className={styles.headerColAction}>Action</div>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className={styles.wrapper}>
      {header}
      <div className={styles.body}>{tree.map((n) => renderNode(n, 0))}</div>
    </div>
  );
};

export default DeptTree;
