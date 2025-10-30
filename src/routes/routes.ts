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
          name: 'Order',
          path: 'order',
          hidden: false,
          component: '@/view/order',
          meta: { title: 'monitor order', icon: 'order', link: null }
        }
      ]
    }
  ];
}
