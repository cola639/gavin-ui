import { message, Modal, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import MenuLayout from './MenuLayout';
import MenuTree, { MenuNode, MenuStatus, OrderPatchItem, UiMenuType } from './MenuTree';

import { deleteMenu, fetchMenuList, updateMenuOrders, type RawMenu } from '@/apis/menu';
import MenuItemModal from './MenuItemModal';
import NewModuleModal from './NewModuleModal';

const normalizeStatus = (status?: string | null): MenuStatus => (status === 'Enabled' ? 'Enabled' : 'Disabled');

const normalizeType = (t?: string): UiMenuType => {
  if (t === 'M' || t === 'Module') return 'Module';
  if (t === 'C' || t === 'Menu') return 'Menu';
  if (t === 'F' || t === 'Function') return 'Function';
  return 'Menu';
};

/** Convert flat array (with parentId) into a nested tree (children[]) */
const buildMenuTreeFromFlat = (rows: RawMenu[]): RawMenu[] => {
  const map = new Map<number, RawMenu & { children: RawMenu[] }>();

  rows.forEach((item) => map.set(item.menuId, { ...item, children: [] }));

  const roots: (RawMenu & { children: RawMenu[] })[] = [];

  map.forEach((item) => {
    const pid = item.parentId;
    if (!pid || !map.has(pid)) roots.push(item);
    else map.get(pid)!.children.push(item);
  });

  const sortTree = (list: RawMenu[]) => {
    list.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    list.forEach((n) => n.children?.length && sortTree(n.children));
  };

  sortTree(roots);
  return roots;
};

/**
 * Map backend tree -> UI MenuNode
 * Also attach:
 * - moduleNameForPerm: top module name
 * - menuNameForPerm: nearest menu name
 */
const mapToMenuNodes = (nodes: RawMenu[], moduleName?: string, menuName?: string): MenuNode[] =>
  nodes.map((item) => {
    const t = normalizeType(item.menuType);

    const nextModule = t === 'Module' ? item.menuName : moduleName;
    const nextMenu = t === 'Menu' ? item.menuName : menuName;

    const routePath = item.path || '';
    const component = item.component || '';

    return {
      id: item.menuId,
      parentId: item.parentId,
      menuType: t,

      name: item.menuName,

      permission: item.perms || '',
      routePath,
      component,

      // table "Component Path" shows component first, otherwise route
      path: component || routePath || '-',

      status: normalizeStatus(item.status),
      icon: item.icon || undefined,

      orderNum: item.orderNum,
      visible: item.visible as any,
      isFrame: item.isFrame as any,
      isCache: item.isCache as any,

      moduleNameForPerm: nextModule,
      menuNameForPerm: nextMenu,

      children: item.children?.length ? mapToMenuNodes(item.children, nextModule, nextMenu) : undefined
    };
  });

const MenuPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [treeData, setTreeData] = useState<MenuNode[]>([]);

  // New module modal (keep it, different UI)
  const [openNew, setOpenNew] = useState(false);

  // Menu/Button modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit'>('create');
  const [createType, setCreateType] = useState<'Menu' | 'Function'>('Menu');
  const [activeNode, setActiveNode] = useState<MenuNode | null>(null);
  const [editInitial, setEditInitial] = useState<any>(null);

  const orderReqSeq = useRef(0);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await fetchMenuList();
      const rows = (res?.data as any) ?? [];
      const tree = buildMenuTreeFromFlat(rows);
      setTreeData(mapToMenuNodes(tree));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error('Failed to load menu list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleSearch = () => setSearchTerm(nameInput.trim());

  const handleReset = () => {
    setNameInput('');
    setSearchTerm('');
    loadMenus();
  };

  // Left "New" button => NewModuleModal
  const handleOpenNew = () => setOpenNew(true);

  // plus dropdown (Add Menu / Add Button)
  const handleAddChild = (parent: MenuNode, type: 'Menu' | 'Function') => {
    setItemModalMode('create');
    setCreateType(type);
    setActiveNode(parent);
    setEditInitial(null);
    setItemModalOpen(true);
  };

  const handleEdit = (node: MenuNode) => {
    setItemModalMode('edit');
    setActiveNode(node);

    setEditInitial({
      menuId: Number(node.id),
      parentId: Number(node.parentId ?? 0),

      menuName: node.name,
      menuType: node.menuType,

      // real route path for edit
      path: node.routePath || '',

      component: node.component || '',
      perms: node.permission || '',

      icon: typeof node.icon === 'string' ? node.icon : '',

      orderNum: node.orderNum ?? 0,

      visible: node.visible ?? 'True',
      status: node.status ?? 'Normal',
      isFrame: node.isFrame ?? 'False',
      isCache: node.isCache ?? 'False'
    });

    setItemModalOpen(true);
  };

  const handleDelete = (node: MenuNode) => {
    Modal.confirm({
      title: 'Delete menu',
      content: `Are you sure you want to delete "${node.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMenu(node.id as number);
          message.success('Menu deleted');
          loadMenus();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          message.error(`${err}`);
        }
      }
    });
  };

  const handleReorder = (nextTree: MenuNode[], orderPatch?: OrderPatchItem[]) => {
    setTreeData(nextTree);

    if (!orderPatch?.length) return;

    const seq = ++orderReqSeq.current;

    updateMenuOrders(orderPatch).catch((err) => {
      // only show error for the latest reorder attempt
      if (seq !== orderReqSeq.current) return;

      // eslint-disable-next-line no-console
      console.error('UPDATE_ORDERS_FAILED', err, orderPatch);
      message.error('Update order failed, reloading...');
      loadMenus();
    });
  };

  const permContext = activeNode
    ? {
        moduleName: activeNode.moduleNameForPerm,
        menuName: activeNode.menuType === 'Menu' ? activeNode.name : activeNode.menuNameForPerm
      }
    : undefined;

  return (
    <main className="">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Menu Management</h1>

      <MenuLayout name={nameInput} onNameChange={setNameInput} onSearch={handleSearch} onReset={handleReset} onNew={handleOpenNew}>
        <Spin spinning={loading}>
          <MenuTree
            data={treeData}
            searchTerm={searchTerm}
            onAddChild={handleAddChild}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </Spin>
      </MenuLayout>

      {/* Keep your NewModuleModal for root module creation */}
      <NewModuleModal open={openNew} onClose={() => setOpenNew(false)} onCreated={loadMenus} parentId={0} />

      {/* Menu/Button modal for plus/edit */}
      <MenuItemModal
        key={`${itemModalMode}-${activeNode?.id ?? 0}-${createType}-${editInitial?.menuId ?? 0}`}
        open={itemModalOpen}
        mode={itemModalMode}
        parentId={itemModalMode === 'create' ? Number(activeNode?.id ?? 0) : Number(editInitial?.parentId ?? 0)}
        createType={itemModalMode === 'create' ? createType : undefined}
        permContext={permContext}
        initial={itemModalMode === 'edit' ? editInitial : undefined}
        onClose={() => setItemModalOpen(false)}
        onSuccess={loadMenus}
      />
    </main>
  );
};

export default MenuPage;
