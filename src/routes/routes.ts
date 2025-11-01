// routes/routes.ts
import type { BackendRoute } from '@/routes/RouteFactory';

export async function fetchRoutes(): Promise<BackendRoute[]> {
  await new Promise((res) => setTimeout(res, 600)); // mock latency

  return [
    {
      name: 'System Management',
      path: '/view',
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
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'user', link: null }
        },
        {
          name: 'Dept',
          path: 'dept',
          hidden: false,
          component: '@/view/order',
          meta: { title: 'monitor dept', icon: 'dept', link: null }
        },
        {
          name: 'Role',
          path: 'role',
          hidden: false,
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'role', link: null }
        },
        {
          name: 'Menu',
          path: 'configure',
          hidden: false,
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'menu', link: null }
        },
        {
          name: 'Configure',
          path: 'configure',
          hidden: false,
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'user', link: null }
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
          name: 'Monitor',
          path: 'online-user',
          hidden: false,
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'monitor', link: null }
        },
        {
          name: 'Quartz',
          path: 'quartz',
          hidden: false,
          component: '@/view/user',
          meta: { title: 'monitor user', icon: 'quartz', link: null }
        }
      ]
    }
  ];
}
