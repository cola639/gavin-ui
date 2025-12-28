import IconTextButton from '@/components/button/IconTextButton';
import Icon from '@/components/Icons';
import { Dropdown as AntDropdown, message } from 'antd';
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './MenuTree.module.scss';

export type MenuStatus = 'Enabled' | 'Disabled';
export type UiMenuType = 'Module' | 'Menu' | 'Function';

export type MenuNode = {
  id: string | number;
  parentId?: number;

  menuType: UiMenuType;
  name: string;

  /** backend icon name, e.g. "system", "user" */
  icon?: string | React.ReactNode;

  /** perms */
  permission?: string;

  /** backend route path, e.g. /system/user */
  routePath?: string;

  /** backend component, e.g. "@/views/xxx" */
  component?: string;

  /** for table display (Component Path column) */
  path?: string;

  status?: MenuStatus;

  /** extra info for modal auto perms */
  moduleNameForPerm?: string; // top module name
  menuNameForPerm?: string; // nearest menu name

  /** optional fields used by edit modal */
  orderNum?: number;
  visible?: 'True' | 'False';
  isFrame?: 'True' | 'False';
  isCache?: 'True' | 'False';

  children?: MenuNode[];
};

export type OrderPatchItem = { menuId: number; orderNum: number };

type MenuTreeProps = {
  data?: MenuNode[];
  onAddChild: (parent: MenuNode, createType: 'Menu' | 'Function') => void;
  onEdit: (node: MenuNode) => void;
  onDelete: (node: MenuNode) => void;
  searchTerm?: string;

  /** called after drop */
  onReorder?: (nextTree: MenuNode[], orderPatch?: OrderPatchItem[]) => void;
};

type IndexPath = number[];

const getNodeAtPath = (nodes: MenuNode[], path: IndexPath): MenuNode | null => {
  let cur: MenuNode | null = null;
  let arr = nodes;

  for (let i = 0; i < path.length; i++) {
    cur = arr[path[i]] ?? null;
    if (!cur) return null;
    arr = cur.children ?? [];
  }

  return cur;
};

const getSiblingsAtParentPath = (nodes: MenuNode[], parentPath: IndexPath): MenuNode[] => {
  if (parentPath.length === 0) return nodes;
  const parent = getNodeAtPath(nodes, parentPath);
  return parent?.children ?? [];
};

const MenuTree: React.FC<MenuTreeProps> = ({ data = [], onAddChild, onEdit, onDelete, searchTerm, onReorder }) => {
  const [tree, setTree] = useState<MenuNode[]>(data);
  const [expanded, setExpanded] = useState<Set<string | number>>(() => new Set());
  const [matchedIds, setMatchedIds] = useState<Set<string | number>>(() => new Set());

  // drag state
  const [dragInfo, setDragInfo] = useState<{ id: string | number; path: IndexPath } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | number | null>(null);

  useEffect(() => setTree(data), [data]);

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const findIndexPath = (nodes: MenuNode[], targetId: string | number, acc: IndexPath = []): IndexPath | null => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const here = [...acc, i];
      if (n.id === targetId) return here;
      if (n.children?.length) {
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
        if (n.children?.length) walk(n.children, [...ancestors, n.id]);
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
    if (!status || status === 'Enabled') return <span className={`${styles.statusBadge} ${styles.statusNormal}`}>Enabled</span>;
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
    if (dragOverId !== targetId) setDragOverId(targetId);
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
      message.warning('You can only reorder menus within the same level.');
      setDragOverId(null);
      return;
    }

    const fromIdx = fromPath[fromPath.length - 1];
    const toIdx = toPath[toPath.length - 1];

    const nextTree = reorderSameLevel(tree, parentFrom, fromIdx, toIdx);
    setTree(nextTree);

    // ✅ build order patch for ONLY the affected siblings
    const siblings = getSiblingsAtParentPath(nextTree, parentFrom);
    const orderPatch: OrderPatchItem[] = siblings.map((n, idx) => ({ menuId: Number(n.id), orderNum: idx })).filter((x) => Number.isFinite(x.menuId));

    onReorder?.(nextTree, orderPatch);

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
      if (typeof node.icon === 'string') {
        return <Icon name={node.icon} size={15} fill={isActive ? '#fafafa' : '#707070'} className="w-[16px] h-[16px] flex-shrink-0" />;
      }
      return <span className={styles.icon}>{node.icon}</span>;
    };

    const rowClass = [styles.row, dragInfo?.id === node.id ? styles.rowDragging : '', dragOverId === node.id ? styles.rowDragOver : '']
      .filter(Boolean)
      .join(' ');

    const canAddChild = node.menuType !== 'Function';

    const addMenu = {
      items: [
        { key: 'Menu', label: 'Add Menu' },
        { key: 'Function', label: 'Add Button' }
      ],
      onClick: ({ key }: { key: string }) => onAddChild(node, key as 'Menu' | 'Function')
    };

    return (
      <React.Fragment key={node.id}>
        <div key={node.id} className={rowClass} onDragOver={(e) => handleDragOver(e, node.id)} onDrop={(e) => handleDrop(e, node)}>
          {/* Name column */}
          <div className={`${styles.colName} ${isMatched ? styles.colNameMatched : ''}`}>
            <div className={styles.colNameInner}>
              <div className={styles.colNameLeft}>
                <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, node)} onDragEnd={handleDragEnd}>
                  <GripVertical size={14} />
                </div>

                <div className={styles.indent} style={{ width: depth * 18 }} />

                {hasChildren ? (
                  <button type="button" className={styles.expandBtn} onClick={() => toggleExpand(node.id)}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <div className={styles.expandPlaceholder} />
                )}

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
            {canAddChild ? (
              <AntDropdown menu={addMenu} trigger={['click']} placement="bottomRight">
                <span>
                  <IconTextButton className="!min-w-[40px]" icon={<Plus size={14} />} size="small" />
                </span>
              </AntDropdown>
            ) : null}

            <IconTextButton className="!min-w-[40px]" icon={<Pencil size={14} />} size="small" onClick={() => onEdit(node)} />
            <IconTextButton className="!min-w-[40px]" icon={<Trash2 size={14} />} size="small" danger onClick={() => onDelete(node)} />
          </div>
        </div>

        {hasChildren && isExpanded ? node.children!.map((c) => renderNode(c, depth + 1)) : null}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerColName}>Name</div>
          <div className={styles.headerColPerm}>Permission Flag</div>
          <div className={styles.headerColPath}>Component Path</div>
          <div className={styles.headerColStatus}>Status</div>
          <div className={styles.headerColAction}>Action</div>
        </div>
      </div>

      <div className={styles.body}>{tree.map((node) => renderNode(node, 0))}</div>
    </div>
  );
};

export default MenuTree;
