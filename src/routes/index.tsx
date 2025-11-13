// routes/index.ts
import NotFound from '@/views/404';
import Dashboard from '@/views/dashboard';
import Layout from '@/views/layout';
import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, redirect, type LoaderFunctionArgs, type RouteObject } from 'react-router-dom';
import { mergeRoutes, RouteMeta, withSuspense, type BackendRoute } from './RouteFactory';
import { fetchRoutes } from './routes'; // your API mock or real call

/** ---- whitelist (no fetch needed for these) ---- */
const Login = lazy(() => import('@/views/login'));

export const whiteList: RouteObject[] = [
  {
    path: 'login', // top-level data routes are relative
    element: withSuspense(<Login />),
    handle: { meta: { title: 'Login', icon: 'login', hidden: false } as RouteMeta }
  },
  {
    path: '404', // top-level data routes are relative
    element: withSuspense(<NotFound />),
    handle: { meta: { title: 'NotFound', icon: 'lost', hidden: false } as RouteMeta }
  }
];

export const constRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/dashboard',
    element: withSuspense(<Layout />),
    children: [
      {
        index: true,
        element: withSuspense(<Dashboard />),
        handle: { meta: { title: 'Dashboard', icon: 'dashboard', hidden: false } as RouteMeta }
      }
    ]
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

/** Decide which router to build for the current location.
 *  Keep it simple: if path is in whitelist → auth router; else → full app.
 *  (If you need token gating, add a token check here and fall back to buildAuthRouter)
 */
export async function createRouterForLocation(pathname: string) {
  // if (isInWhitelist(pathname)) {
  //   return buildAuthRouter();
  // }
  // const token = getToken();
  // if (!token) {
  //   return buildAuthRouter();
  // }
  return buildAppRouter();
}

// helper: build /login?redirect=ENCODED
const toLogin = (from: string) => `/login?redirect=${encodeURIComponent(from)}`;

// reusable loader that redirects to /login with the current URL preserved
const loginRedirectLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const from = url.pathname + url.search; // you can also include url.hash if you want
  // avoid infinite loop when already on /login
  if (url.pathname.startsWith('/login')) return redirect('/login');
  return redirect(toLogin(from));
};

// ---- token helper (replace with your actual auth) ----
export function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

// Full app router (fetch + merge; includes whitelist)
export async function buildAppRouter() {
  // const backend: BackendRoute[] = await fetchRoutes();
  // const merged = mergeRoute(whiteList, backend);
  // return createBrowserRouter([...merged, { path: '*', element: <NotFound /> }]);
}

export async function initRoutes() {
  console.log('Initializing routes for', window.location.pathname);

  if (isInWhitelist(window.location.pathname)) {
    // Whitelist: allow login/etc, but anything else -> /login?redirect=<original>
    return createBrowserRouter([...whiteList, { path: '*', loader: loginRedirectLoader }]);
  }

  if (getToken()) {
    // Has token: build your authed router (can be async-fetched inside getRoutes)
    return buildAppRouter();
  }

  // No token: index and everything else go to /login?redirect=<original>
  return createBrowserRouter([
    { index: true, loader: loginRedirectLoader }, // visiting '/'
    ...whiteList,
    { path: '*', loader: loginRedirectLoader }
  ]);
}
