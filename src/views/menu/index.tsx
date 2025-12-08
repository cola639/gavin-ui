import React, { useState } from 'react';
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

const MenuPage: React.FC = () => {
  const [data, setData] = useState<MenuNode[]>(initialData);

  const handleAddChild = (parent: MenuNode) => {
    // TODO: open modal, etc.
    console.log('add child to', parent);
  };

  const handleEdit = (node: MenuNode) => {
    // TODO: open edit modal
    console.log('edit', node);
  };

  const handleDelete = (node: MenuNode) => {
    console.log('delete', node);
    // TODO: confirm + delete from tree
  };

  return <MenuTree data={data} onAddChild={handleAddChild} onEdit={handleEdit} onDelete={handleDelete} />;
};

export default MenuPage;
