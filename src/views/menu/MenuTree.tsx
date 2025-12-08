// src/views/menu/MenuTree.tsx
import IconTextButton from '@/components/button/IconTextButton';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './MenuTree.module.scss';

export type MenuStatus = 'Normal' | 'Disabled';

export type MenuNode = {
  id: string | number;
  name: string;
  icon?: React.ReactNode;
  permission?: string;
  path?: string;
  status?: MenuStatus;
  children?: MenuNode[];
};

type MenuTreeProps = {
  data?: MenuNode[];
  onAddChild: (parent: MenuNode) => void;
  onEdit: (node: MenuNode) => void;
  onDelete: (node: MenuNode) => void;
  /** search keyword used to auto-expand & highlight */
  searchTerm?: string;
};

const MenuTree: React.FC<MenuTreeProps> = ({ data = [], onAddChild, onEdit, onDelete, searchTerm }) => {
  const [expanded, setExpanded] = useState<Set<string | number>>(() => new Set());
  const [matchedIds, setMatchedIds] = useState<Set<string | number>>(() => new Set());

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // auto-expand ancestors & highlight matches when `searchTerm` changes
  useEffect(() => {
    const term = searchTerm?.trim().toLowerCase();
    if (!term) {
      setMatchedIds(new Set());
      return;
    }

    const nextMatches = new Set<string | number>();
    const toExpand = new Set<string | number>();

    const walk = (nodes: MenuNode[], ancestors: Array<string | number>) => {
      for (const n of nodes) {
        const isMatch = n.name.toLowerCase().includes(term);
        if (isMatch) {
          nextMatches.add(n.id);
          ancestors.forEach((id) => toExpand.add(id));
        }
        if (n.children && n.children.length) {
          walk(n.children, [...ancestors, n.id]);
        }
      }
    };

    walk(data, []);

    setMatchedIds(nextMatches);

    if (toExpand.size) {
      setExpanded((prev) => {
        const next = new Set(prev);
        toExpand.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchTerm, data]);

  const renderStatusBadge = (status?: MenuStatus) => {
    if (!status || status === 'Normal') {
      return <span className={`${styles.statusBadge} ${styles.statusNormal}`}>Normal</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusDisabled}`}>Disabled</span>;
  };

  const renderNode = (node: MenuNode, depth: number): React.ReactNode => {
    const hasChildren = !!(node.children && node.children.length);
    const isExpanded = expanded.has(node.id);
    const isMatched = matchedIds.has(node.id);

    const row = (
      <div key={node.id} className={styles.row}>
        {/* Name column */}
        <div className={`${styles.colName} ${isMatched ? styles.colNameMatched : ''}`}>
          <div className={styles.colNameInner}>
            <div className={styles.colNameLeft}>
              {/* indent */}
              <div className={styles.indent} style={{ width: depth * 18 }} />
              {/* caret */}
              {hasChildren ? (
                <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <div className={styles.expandPlaceholder} />
              )}
              {/* icon + name */}
              <div className={styles.iconAndName}>
                {node.icon && <span className={styles.icon}>{node.icon}</span>}
                <span className={`${styles.name} ${isMatched ? styles.nameMatched : ''}`}>{node.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Permission flag */}
        <div className={styles.colPerm}>{node.permission || '-'}</div>

        {/* Component path */}
        <div className={styles.colPath}>{node.path || '-'}</div>

        {/* Status */}
        <div className={styles.colStatus}>{renderStatusBadge(node.status)}</div>

        {/* Action */}
        <div className={styles.colAction}>
          <IconTextButton className="!min-w-[50px]" icon={<Plus size={14} />} size="small" onClick={() => onAddChild(node)} />
          <IconTextButton className="!min-w-[50px]" icon={<Pencil size={14} />} size="small" onClick={() => onEdit(node)} />
          <IconTextButton className="!min-w-[50px]" icon={<Trash2 size={14} />} size="small" danger onClick={() => onDelete(node)} />
        </div>
      </div>
    );

    const children = hasChildren && isExpanded ? node.children!.map((c) => renderNode(c, depth + 1)) : null;

    return (
      <React.Fragment key={node.id}>
        {row}
        {children}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* header */}
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerColName}>Name</div>
          <div className={styles.headerColPerm}>Permission Flag</div>
          <div className={styles.headerColPath}>Component Path</div>
          <div className={styles.headerColStatus}>Status</div>
          <div className={styles.headerColAction}>Action</div>
        </div>
      </div>

      {/* body */}
      <div className={styles.body}>{data.map((node) => renderNode(node, 0))}</div>
    </div>
  );
};

export default MenuTree;
