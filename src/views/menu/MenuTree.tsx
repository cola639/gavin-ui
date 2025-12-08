import React, { useState } from 'react';
import styles from './menuTree.module.scss';

export type MenuStatus = 'Normal' | 'Disabled';

export interface MenuNode {
  id: string | number;
  name: string;
  icon?: React.ReactNode;
  permission?: string;
  path?: string;
  status?: MenuStatus;
  children?: MenuNode[];
}

type MenuTreeProps = {
  data?: MenuNode[];
  onAddChild: (parent: MenuNode) => void;
  onEdit: (node: MenuNode) => void;
  onDelete: (node: MenuNode) => void;
};

const MenuTree: React.FC<MenuTreeProps> = ({ data = [], onAddChild, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState<Set<string | number>>(() => new Set());

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNode = (node: MenuNode, depth: number): React.ReactNode => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isExpanded = expanded.has(node.id);

    return (
      <React.Fragment key={node.id}>
        <div className={styles.row}>
          {/* name + icon + indent + expand icon */}
          <div className={styles.colName}>
            <div className={styles.nameInner} style={{ paddingLeft: depth * 18 }}>
              {hasChildren ? (
                <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? '▾' : '▸'}
                </button>
              ) : (
                <span className={styles.expandPlaceholder} />
              )}

              <span className={styles.nodeIcon}>{node.icon ?? '📁'}</span>
              <span className={styles.nodeName}>{node.name}</span>
            </div>
          </div>

          {/* permission flag */}
          <div className={styles.colPerm}>{node.permission || '-'}</div>

          {/* component path */}
          <div className={styles.colPath}>{node.path || '-'}</div>

          {/* status */}
          <div className={styles.colStatus}>
            {node.status ? <span className={node.status === 'Normal' ? styles.statusNormal : styles.statusDisabled}>{node.status}</span> : '-'}
          </div>

          {/* actions */}
          <div className={styles.colActions}>
            <button type="button" className={styles.actionBtn} onClick={() => onAddChild(node)}>
              + Child
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => onEdit(node)}>
              Modify
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => onDelete(node)}>
              Delete
            </button>
          </div>
        </div>

        {/* children */}
        {hasChildren && isExpanded && node.children!.map((child) => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.wrap}>
      {/* header */}
      <div className={`${styles.row} ${styles.header}`}>
        <div className={styles.colName}>Name</div>
        <div className={styles.colPerm}>Permission Flag</div>
        <div className={styles.colPath}>Component Path</div>
        <div className={styles.colStatus}>Status</div>
        <div className={styles.colActions}>Action</div>
      </div>

      {/* body */}
      <div className={styles.body}>{data.map((node) => renderNode(node, 0))}</div>
    </div>
  );
};

export default MenuTree;
