// routes/routes.ts
import type { BackendRoute } from '@/routes/RouteFactory';

export async function fetchRoutes(): Promise<BackendRoute[]> {
  await new Promise((res) => setTimeout(res, 600)); // mock latency

  return [
    {
      name: 'System Management',
      path: '/views',
      hidden: false,
      redirect: 'noRedirect',
      component: '@/views/layout',
      alwaysShow: true,
      meta: { title: 'system management', icon: 'monitor', link: null },
      children: [
        {
          name: 'User',
          path: 'user',
          hidden: false,
          component: '@/views/user',
          meta: { title: 'monitor user', icon: 'user', link: null }
        },
        {
          name: 'Dept',
          path: 'dept',
          hidden: false,
          component: '@/views/dept',
          meta: { title: 'monitor dept', icon: 'dept', link: null }
        },
        {
          name: 'Role',
          path: 'role',
          hidden: false,
          component: '@/views/role',
          meta: { title: 'role management', icon: 'role', link: null }
        },
        {
          name: 'Menu',
          path: 'menu',
          hidden: false,
          component: '@/views/menu',
          meta: { title: 'menu management', icon: 'menu', link: null }
        }
      ]
    },
    {
      name: 'System Monitor',
      path: '/monitor',
      hidden: false,
      redirect: 'noRedirect',
      component: '@/views/layout',
      alwaysShow: true,
      meta: { title: 'system mnitor', icon: 'monitor', link: null },
      children: [
        {
          name: 'Server',
          path: 'server',
          hidden: false,
          component: '@/views/user',
          meta: { title: 'monitor user', icon: 'monitor', link: null }
        },
        {
          name: 'Online Users',
          path: 'online-user',
          hidden: false,
          component: '@/views/user',
          meta: { title: 'monitor user', icon: 'monitor', link: null }
        },
        {
          name: 'Quartz',
          path: 'quartz',
          hidden: false,
          component: '@/views/user',
          meta: { title: 'monitor user', icon: 'quartz', link: null }
        }
      ]
    }
  ];
}
