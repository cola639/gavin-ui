// src/views/menu/MenuTree.tsx
import IconTextButton from '@/components/button/IconTextButton';
import Icon from '@/components/Icons';
import { message } from 'antd';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './MenuTree.module.scss';

export type MenuStatus = 'Normal' | 'Disabled';

export type MenuNode = {
  id: string | number;
  name: string;
  /** backend icon name, e.g. "system", "user", ... */
  icon?: string | React.ReactNode; // allow both string (for <Icon/>) and custom React node
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
  /** optional: bubble up reordered tree */
  onReorder?: (nextTree: MenuNode[]) => void;
};

type IndexPath = number[];

const MenuTree: React.FC<MenuTreeProps> = ({ data = [], onAddChild, onEdit, onDelete, searchTerm, onReorder }) => {
  const [tree, setTree] = useState<MenuNode[]>(data);

  const [expanded, setExpanded] = useState<Set<string | number>>(() => new Set());
  const [matchedIds, setMatchedIds] = useState<Set<string | number>>(() => new Set());

  // drag state
  const [dragInfo, setDragInfo] = useState<{ id: string | number; path: IndexPath } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | number | null>(null);

  // keep local tree in sync with parent data
  useEffect(() => {
    setTree(data);
  }, [data]);

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // find index path for a node id in the current tree
  const findIndexPath = (nodes: MenuNode[], targetId: string | number, acc: IndexPath = []): IndexPath | null => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const here = [...acc, i];
      if (n.id === targetId) return here;
      if (n.children && n.children.length) {
        const childPath = findIndexPath(n.children, targetId, here);
        if (childPath) return childPath;
      }
    }
    return null;
  };

  // reorder within same-level sibling array
  const reorderSameLevel = (nodes: MenuNode[], parentPath: IndexPath, fromIndex: number, toIndex: number, depth = 0): MenuNode[] => {
    if (depth === parentPath.length) {
      const arr = [...nodes];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    }

    const idx = parentPath[depth];
    const node = nodes[idx];
    const children = node.children ?? [];
    const nextChildren = reorderSameLevel(children, parentPath, fromIndex, toIndex, depth + 1);
    const nextNodes = [...nodes];
    nextNodes[idx] = { ...node, children: nextChildren };
    return nextNodes;
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

    walk(tree, []);

    setMatchedIds(nextMatches);

    if (toExpand.size) {
      setExpanded((prev) => {
        const next = new Set(prev);
        toExpand.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchTerm, tree]);

  const renderStatusBadge = (status?: MenuStatus) => {
    if (!status || status === 'Normal') {
      return <span className={`${styles.statusBadge} ${styles.statusNormal}`}>Normal</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusDisabled}`}>Disabled</span>;
  };

  // DRAG HANDLERS
  const handleDragStart = (e: React.DragEvent, node: MenuNode) => {
    e.stopPropagation();
    const path = findIndexPath(tree, node.id);
    if (!path) return;
    setDragInfo({ id: node.id, path });
    setDragOverId(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(node.id));
  };

  const handleDragEnd = () => {
    setDragInfo(null);
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | number) => {
    e.preventDefault(); // allow drop
    if (!dragInfo) return;
    if (dragOverId !== targetId) {
      setDragOverId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, target: MenuNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo || dragInfo.id === target.id) {
      setDragOverId(null);
      return;
    }

    const fromPath = dragInfo.path;
    const toPath = findIndexPath(tree, target.id);
    if (!toPath) {
      setDragOverId(null);
      return;
    }

    const parentFrom = fromPath.slice(0, -1);
    const parentTo = toPath.slice(0, -1);

    // ❗ only allow same-level sort
    const sameParent = parentFrom.length === parentTo.length && parentFrom.every((v, i) => v === parentTo[i]);

    if (!sameParent) {
      // alarm when dragging across levels
      message.warning('You can only reorder menus within the same level.');
      setDragOverId(null);
      return;
    }

    const fromIdx = fromPath[fromPath.length - 1];
    const toIdx = toPath[toPath.length - 1];

    const nextTree = reorderSameLevel(tree, parentFrom, fromIdx, toIdx);
    setTree(nextTree);
    onReorder?.(nextTree);
    setDragInfo(null);
    setDragOverId(null);
  };

  const renderNode = (node: MenuNode, depth: number): React.ReactNode => {
    const hasChildren = !!(node.children && node.children.length);
    const isExpanded = expanded.has(node.id);
    const isMatched = matchedIds.has(node.id);
    const isActive = isMatched;

    const renderIcon = () => {
      if (!node.icon) return null;

      // if backend gave you a string, use <Icon name="..." />
      if (typeof node.icon === 'string') {
        return <Icon name={node.icon} size={15} fill={isActive ? '#fafafa' : '#707070'} className="w-[16px] h-[16px] flex-shrink-0" />;
      }

      // else assume it’s already a ReactNode (emoji/custom)
      return <span className={styles.icon}>{node.icon}</span>;
    };

    const rowClass = [styles.row, dragInfo?.id === node.id ? styles.rowDragging : '', dragOverId === node.id ? styles.rowDragOver : '']
      .filter(Boolean)
      .join(' ');

    const row = (
      <div key={node.id} className={rowClass} onDragOver={(e) => handleDragOver(e, node.id)} onDrop={(e) => handleDrop(e, node)}>
        {/* Name column */}
        <div className={`${styles.colName} ${isMatched ? styles.colNameMatched : ''}`}>
          <div className={styles.colNameInner}>
            <div className={styles.colNameLeft}>
              {/* drag handle */}
              <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, node)} onDragEnd={handleDragEnd}>
                <GripVertical size={14} />
              </div>

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
                {renderIcon()}
                <span className={`${styles.name} ${isActive ? styles.nameMatched : ''}`}>{node.name}</span>
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
          <IconTextButton className="!min-w-[40px]" icon={<Plus size={14} />} size="small" onClick={() => onAddChild(node)} />
          <IconTextButton className="!min-w-[40px]" icon={<Pencil size={14} />} size="small" onClick={() => onEdit(node)} />
          <IconTextButton className="!min-w-[40px]" icon={<Trash2 size={14} />} size="small" danger onClick={() => onDelete(node)} />
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
      <div className={styles.body}>{tree.map((node) => renderNode(node, 0))}</div>
    </div>
  );
};

export default MenuTree;
