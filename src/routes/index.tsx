// router.tsx
import NotFound from '@/views/404';
import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { mergeRoute, RouteMeta, withSuspense } from './RouteFactory';

// ---- whitelist ----
const Login = lazy(() => import('@/views/login'));

const whiteList = [
  {
    path: 'login',
    element: withSuspense(<Login />),
    handle: { meta: { title: 'Login', icon: 'login', hidden: false } as RouteMeta }
  }
];

// ---- fetched JSON ----
const fetchJson = [
  {
    name: 'view',
    path: '/view',
    hidden: false,
    redirect: 'noRedirect',
    component: '@/views/layout',
    alwaysShow: true,
    meta: { title: 'monitor management', icon: 'monitor', link: null },
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

// ---- merge & build router ----
const merged = mergeRoute(whiteList, fetchJson);

const router = createBrowserRouter([...merged, { path: '*', element: <NotFound /> }]);
export default router;
