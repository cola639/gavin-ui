// src/views/menu/index.tsx
import { message, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

import MenuLayout from './MenuLayout';
import MenuTree, { MenuNode, MenuStatus } from './MenuTree';

import { createMenu, deleteMenu, fetchMenuList, updateMenu, type RawMenu } from '@/apis/menu';

/* ---------- helpers: flat list -> tree, then -> MenuNode[] ---------- */

const normalizeStatus = (status?: string | null): MenuStatus => (status === 'Normal' ? 'Normal' : 'Disabled');

/** Convert flat array (with parentId) into a nested tree (children[]) */
const buildMenuTreeFromFlat = (rows: RawMenu[]): RawMenu[] => {
  const map = new Map<number, RawMenu & { children: RawMenu[] }>();

  rows.forEach((item) => {
    map.set(item.menuId, { ...item, children: [] });
  });

  const roots: (RawMenu & { children: RawMenu[] })[] = [];

  map.forEach((item) => {
    const pid = item.parentId;
    if (!pid || !map.has(pid)) {
      // top level
      roots.push(item);
    } else {
      map.get(pid)!.children.push(item);
    }
  });

  const sortTree = (list: RawMenu[]) => {
    list.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    list.forEach((n) => {
      if (n.children && n.children.length) {
        sortTree(n.children);
      }
    });
  };

  sortTree(roots);
  return roots;
};

/** Map backend RawMenu tree -> UI MenuNode tree used by MenuTree */
const mapToMenuNodes = (nodes: RawMenu[]): MenuNode[] =>
  nodes.map((item) => ({
    id: item.menuId,
    name: item.menuName,
    permission: item.perms || '',
    path: item.component || item.path || '',
    status: normalizeStatus(item.status),
    icon: item.icon || undefined,
    // you can render icons later by mapping item.icon -> lucide-react icon
    children: item.children && item.children.length ? mapToMenuNodes(item.children) : undefined
  }));

/* -------------------------------------------------------------------- */

const MenuPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // search box text + actual search term passed into MenuTree
  const [nameInput, setNameInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // UI tree for MenuTree
  const [treeData, setTreeData] = useState<MenuNode[]>([]);

  /** Load menus from backend and build tree for MenuTree */
  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await fetchMenuList();
      const rows = res?.data as any;
      const tree = buildMenuTreeFromFlat(rows);
      setTreeData(mapToMenuNodes(tree));
    } catch (err) {
      console.error(err);
      message.error('Failed to load menu list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  /* ---------- left panel actions ---------- */

  const handleSearch = () => {
    setSearchTerm(nameInput.trim());
  };

  const handleReset = () => {
    setNameInput('');
    setSearchTerm('');
    loadMenus();
  };

  const handleNewRoot = async () => {
    const menuName = window.prompt('New root menu name');
    if (!menuName) return;

    try {
      await createMenu({
        menuName,
        parentId: 0,
        orderNum: 1,
        status: 'Normal',
        menuType: 'M',
        visible: 'True',
        isFrame: 'False',
        isCache: 'False'
      });
      message.success('Root menu created');
      loadMenus();
    } catch (err) {
      console.error(err);
      message.error('Failed to create root menu');
    }
  };

  /* ---------- MenuTree actions ---------- */

  const handleAddChild = async (parent: MenuNode) => {
    const menuName = window.prompt(`New child under "${parent.name}"`);
    if (!menuName) return;

    try {
      await createMenu({
        menuName,
        parentId: Number(parent.id),
        orderNum: 1,
        status: 'Normal',
        menuType: 'C',
        visible: 'True',
        isFrame: 'False',
        isCache: 'False'
      });
      message.success('Menu created');
      loadMenus();
    } catch (err) {
      console.error(err);
      message.error('Failed to create child menu');
    }
  };

  const handleEdit = async (node: MenuNode) => {
    const menuName = window.prompt('Edit menu name', node.name);
    if (!menuName || menuName === node.name) return;

    try {
      await updateMenu({
        menuId: Number(node.id),
        menuName
      });
      message.success('Menu updated');
      loadMenus();
    } catch (err) {
      console.error(err);
      message.error('Failed to update menu');
    }
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
          console.error(err);
          message.error(`${err}`);
        }
      }
    });
  };

  /** Drag-sort from MenuTree – for now just keep it in memory */
  const handleReorder = (nextTree: MenuNode[]) => {
    setTreeData(nextTree);
    // If you later add a "sort" API, compute new orderNum per sibling here
    // and call updateMenu(...) or a dedicated reorder endpoint.
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Menu Management</h1>

      <MenuLayout name={nameInput} onNameChange={setNameInput} onSearch={handleSearch} onReset={handleReset} onNew={handleNewRoot}>
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
    </main>
  );
};

export default MenuPage;
