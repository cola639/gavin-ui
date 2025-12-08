import React, { useState } from 'react';
import MenuLayout from './MenuLayout';
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
                name: 'User Query Deep',
                permission: 'system:user:query',
                path: 'system/user/index',
                status: 'Normal',
                children: [
                  {
                    id: 1123681,
                    name: 'User Query Deeper',
                    permission: 'system:user:query',
                    path: 'system/user/index',
                    status: 'Normal',
                    children: [
                      {
                        id: 112310,
                        name: 'User Query Last',
                        permission: 'system:user:query',
                        path: 'system/user/index',
                        status: 'Normal'
                      },
                      {
                        id: 1121230,
                        name: 'User Add Last',
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
                id: 1121234,
                name: 'User Add Sibling',
                permission: 'system:user:add',
                path: 'system/user/index',
                status: 'Normal'
              }
            ]
          },
          {
            id: 112,
            name: 'User Add Root Child',
            permission: 'system:user:add',
            path: 'system/user/index',
            status: 'Normal'
          }
        ]
      }
    ]
  }
];

const MenuPage: React.FC = () => {
  const [data, setData] = useState<MenuNode[]>(initialData);

  // what user is typing
  const [nameInput, setNameInput] = useState('');
  // actual search keyword that drives expand/highlight
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddChild = (parent: MenuNode) => {
    console.log('add child to', parent);
    // TODO: open modal & update data via setData
  };

  const handleEdit = (node: MenuNode) => {
    console.log('edit', node);
    // TODO: open modal & update data via setData
  };

  const handleDelete = (node: MenuNode) => {
    console.log('delete', node);
    // TODO: confirm + remove from tree via setData
  };

  const handleSearch = () => {
    setSearchTerm(nameInput.trim());
  };

  const handleReset = () => {
    setNameInput('');
    setSearchTerm('');
    // if later fetching from backend, refetch here
    setData(initialData);
  };

  const handleNew = () => {
    console.log('create new root menu');
    // TODO: open "create root menu" modal
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-5 lg:p-8">
      <h1 className="mb-5 text-3xl font-semibold text-gray-900">Menu Management</h1>

      <MenuLayout name={nameInput} onNameChange={setNameInput} onSearch={handleSearch} onReset={handleReset} onNew={handleNew}>
        <MenuTree data={data} searchTerm={searchTerm} onAddChild={handleAddChild} onEdit={handleEdit} onDelete={handleDelete} />
      </MenuLayout>
    </main>
  );
};

export default MenuPage;
