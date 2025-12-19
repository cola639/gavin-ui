// routes/RouteFactory.ts
import SectionLayout from '@/views/layout';
import React, { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/** ---------- shared types & helpers ---------- */
export type RouteMeta = {
  title?: string;
  icon?: string;
  link?: string | null;
  alwaysShow?: boolean;
  hidden?: boolean;
};

export const withSuspense = (node: React.ReactNode) => <Suspense fallback={<div>Loading…</div>}>{node}</Suspense>;

/** ---------- backend schema ---------- */
export type BackendRoute = {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string;
  component: string;
  alwaysShow?: boolean;
  meta?: { title?: string; icon?: string; link?: string | null };
  children?: BackendRoute[];
};

/** ---------- utils ---------- */
const ensureRelative = (p = '') => p.replace(/^\//, '');
const norm = (p = '') => ensureRelative(p).replace(/\/+$/, ''); // remove trailing

function dedupeChildren(children: RouteObject[] | undefined): RouteObject[] | undefined {
  if (!children?.length) return children;
  const map = new Map<string, RouteObject>();
  for (const r of children) {
    const key = typeof r.path === 'string' ? norm(r.path) : r.index ? '__index__' : '';
    if (!map.has(key)) {
      // also dedupe recursively
      if (r.children) r.children = dedupeChildren(r.children);
      map.set(key, r);
    }
  }
  return [...map.values()];
}

/** ---------- component resolver ---------- */
type ResolvedElement = React.ReactNode;
type ComponentResolver = (component: string, meta?: RouteMeta) => ResolvedElement;

const defaultResolver: ComponentResolver = (component, meta) => {
  if (component === '@/views/layout') {
    // You can pass meta to SectionLayout if needed
    return <SectionLayout />;
  }

  // Explicit map first (fast + tree-shakable)
  const map: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    '@/views/user': () => import('@/views/user'),
    '@/views/order': () => import('@/views/order'),
    '@/views/menu': () => import('@/views/menu'),
    '@/views/dept': () => import('@/views/dept'),
    '@/views/role': () => import('@/views/role')
  };

  const importer = map[component];
  if (importer) {
    const Lazy = lazy(importer);
    return withSuspense(<Lazy />);
  }

  // Fallback heuristic: "@/a/b" → "@/views/a/b"
  const guessed = component.replace(/^@\/?/, '');
  const Lazy = lazy(() => import(`@/views/${guessed}`));
  return withSuspense(<Lazy />);
};

/** ---------- transformer ---------- */
function toRouteObject(node: BackendRoute, resolver: ComponentResolver): RouteObject {
  const meta: RouteMeta = {
    title: node.meta?.title,
    icon: node.meta?.icon,
    link: node.meta?.link ?? null,
    alwaysShow: node.alwaysShow,
    hidden: node.hidden
  };

  const route: RouteObject = {
    path: norm(node.path),
    element: resolver(node.component, meta),
    handle: { meta }
  };

  if (node.children?.length) {
    route.children = dedupeChildren(node.children.map((child) => toRouteObject(child, resolver)));
  }

  return route;
}

/** ---------- public API ---------- */
export function mergeRoutes(
  whiteList: RouteObject[],
  constant: RouteObject[],
  backend: BackendRoute[],
  resolver: ComponentResolver = defaultResolver
): RouteObject[] {
  const backendRoutes = backend.map((n) => toRouteObject(n, resolver));

  const out: RouteObject[] = [];
  const seen = new Set<string>();

  const push = (r: RouteObject) => {
    if (typeof r.path === 'string') r.path = norm(r.path);
    const key = typeof r.path === 'string' ? r.path : r.index ? '__index__' : '';
    if (!seen.has(key)) {
      if (r.children) r.children = dedupeChildren(r.children);
      out.push(r);
      seen.add(key);
    }
  };

  // priority: whitelist → constant → backend
  whiteList.forEach(push);
  constant.forEach(push);
  backendRoutes.forEach(push);

  return out;
}
