// src/views/menu/MenuPage.tsx
import React, { useMemo, useState } from 'react';
import MenuLayout from './MenuLayout'; // the left/right layout with lucide-react buttons
import MenuTree, { MenuNode } from './MenuTree';

const initialData: MenuNode[] = [
  {
    id: 1,
    name: 'System Management',
    icon: '🛠',
    permission: 'system',
    path: 'system',
    status: 'Normal',
    children: [
      {
        id: 11,
        name: 'User Management',
        icon: '👤',
        permission: 'system:user:list',
        path: 'system/user/index',
        status: 'Normal',
        children: [
          {
            id: 111,
            name: 'User Query',
            permission: 'system:user:query',
            path: 'system/user/index',
            status: 'Normal',
            children: [
              {
                id: 11231,
                name: 'User Query',
                permission: 'system:user:query',
                path: 'system/user/index',
                status: 'Normal',
                children: [
                  {
                    id: 1123681,
                    name: 'User Query',
                    permission: 'system:user:query',
                    path: 'system/user/index',
                    status: 'Normal',
                    children: [
                      {
                        id: 112310,
                        name: 'User Query',
                        permission: 'system:user:query',
                        path: 'system/user/index',
                        status: 'Normal'
                      },
                      {
                        id: 1121230,
                        name: 'User Add last',
                        permission: 'system:user:add',
                        path: 'system/user/index',
                        status: 'Normal'
                      }
                    ]
                  },
                  {
                    id: 112123,
                    name: 'User Add',
                    permission: 'system:user:add',
                    path: 'system/user/index',
                    status: 'Normal'
                  }
                ]
              },
              {
                id: 112123,
                name: 'User Add',
                permission: 'system:user:add',
                path: 'system/user/index',
                status: 'Normal'
              }
            ]
          },
          {
            id: 112,
            name: 'User Add',
            permission: 'system:user:add',
            path: 'system/user/index',
            status: 'Normal'
          }
        ]
      }
    ]
  }
];

/** simple recursive filter by name */
const filterByName = (nodes: MenuNode[], term: string): MenuNode[] => {
  if (!term.trim()) return nodes;

  const lower = term.toLowerCase();

  const walk = (list: MenuNode[]): MenuNode[] => {
    const result: MenuNode[] = [];

    for (const n of list) {
      const matchSelf = n.name.toLowerCase().includes(lower);
      const children = n.children ? walk(n.children) : undefined;

      if (matchSelf || (children && children.length)) {
        // only add `children` when it actually exists, so it stays optional
        result.push({
          ...n,
          ...(children && children.length ? { children } : {})
        });
      }
    }

    return result;
  };

  return walk(nodes);
};

const MenuPage: React.FC = () => {
  const [data, setData] = useState<MenuNode[]>(initialData);
  const [nameFilter, setNameFilter] = useState('');

  const filteredData = useMemo(() => filterByName(data, nameFilter), [data, nameFilter]);

  const handleAddChild = (parent: MenuNode) => {
    // TODO: open "new menu" modal
    console.log('add child to', parent);
  };

  const handleEdit = (node: MenuNode) => {
    // TODO: open "edit menu" modal
    console.log('edit', node);
  };

  const handleDelete = (node: MenuNode) => {
    // TODO: confirm + delete from tree & setData(newTree)
    console.log('delete', node);
  };

  // LEFT-panel actions
  const handleSearch = () => {
    // with current implementation, filtering happens live while typing
    // you can trigger API call here later if needed
    console.log('search by name:', nameFilter);
  };

  const handleReset = () => {
    setNameFilter('');
    setData(initialData); // or refetch from backend
  };

  const handleNew = () => {
    // open "create root menu" dialog
    console.log('create new root menu');
  };

  return (
    <MenuLayout name={nameFilter} onNameChange={setNameFilter} onSearch={handleSearch} onReset={handleReset} onNew={handleNew}>
      {/* right side: your menu tree table */}
      <MenuTree data={filteredData} onAddChild={handleAddChild} onEdit={handleEdit} onDelete={handleDelete} />
    </MenuLayout>
  );
};

export default MenuPage;
