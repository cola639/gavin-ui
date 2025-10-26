// routes/index.ts
import NotFound from '@/views/404';
import React, { lazy } from 'react';
import { createBrowserRouter, redirect, type RouteObject } from 'react-router-dom';
import { mergeRoute, RouteMeta, withSuspense, type BackendRoute } from './RouteFactory';
import { fetchRoutes } from './routes'; // your API mock or real call

/** ---- whitelist (no fetch needed for these) ---- */
const Login = lazy(() => import('@/views/login'));

export const whiteList: RouteObject[] = [
  {
    path: 'login', // top-level data routes are relative
    element: withSuspense(<Login />),
    handle: { meta: { title: 'Login', icon: 'login', hidden: false } as RouteMeta }
  }
];

/** ---- small helpers ---- */
const normalize = (p = '') => p.replace(/^\/+|\/+$/g, '');
export const isInWhitelist = (pathname: string) => {
  const current = normalize(pathname);
  const paths = whiteList.map((r) => (typeof r.path === 'string' ? normalize(r.path) : ''));
  return new Set(paths).has(current);
};

/** ---- routers ---- */
// Whitelist-only router (no backend fetch)
export function buildAuthRouter() {
  return createBrowserRouter([
    { index: true, loader: () => redirect('/login') }, // visiting '/'
    ...whiteList,
    { path: '*', loader: () => redirect('/login') } // everything else → /login
  ]);
}

// Full app router (fetch + merge; includes whitelist)
export async function buildAppRouter() {
  const backend: BackendRoute[] = await fetchRoutes();
  const merged = mergeRoute(whiteList, backend);
  return createBrowserRouter([...merged, { path: '*', element: <NotFound /> }]);
}

/** Decide which router to build for the current location.
 *  Keep it simple: if path is in whitelist → auth router; else → full app.
 *  (If you need token gating, add a token check here and fall back to buildAuthRouter)
 */
export async function createRouterForLocation(pathname: string) {
  if (isInWhitelist(pathname)) {
    return buildAuthRouter();
  }
  // const token = getToken();
  // if (!token) {
  //   return buildAuthRouter();
  // }
  return buildAppRouter();
}

// ---- token helper (replace with your actual auth) ----
export function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}
