// routes/mergeRoute.tsx
import SectionLayout from '@/views/layout';
import React, { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// ---------- shared helpers ----------
export type RouteMeta = {
  title?: string;
  icon?: string;
  link?: string | null;
  alwaysShow?: boolean;
  hidden?: boolean;
};

export const withSuspense = (node: React.ReactNode) => <Suspense fallback={<div>Loading…</div>}>{node}</Suspense>;

// ---------- backend schema ----------
export type BackendRoute = {
  name?: string;
  path: string; // '/system' or 'user'
  hidden?: boolean;
  redirect?: string; // 'noRedirect' or actual path
  component: string; // '@/components/layout' | '@/system/user' | ...
  alwaysShow?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    link?: string | null;
  };
  children?: BackendRoute[];
};

// ---------- component resolver ----------
// You can grow this map as needed. It resolves backend "component" strings to React components.
type ResolvedElement = React.ReactNode;
type ComponentResolver = (component: string, meta?: RouteMeta) => ResolvedElement;

const defaultResolver: ComponentResolver = (component, meta) => {
  // Layout node
  if (component === '@/views/layout') {
    return <SectionLayout />;
  }

  // Page nodes — explicit map first
  const map: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    '@/view/user': () => import('../views/user'),
    '@/view/order': () => import('../views/order')
  };

  const importer = map[component];
  if (!importer) {
    // Fallback heuristic: "@/a/b/c" -> "../pages/a/b/c"
    const guessed = component.replace(/^@\/?/, '');
    return withSuspense(React.createElement(lazy(() => import(`../views/${guessed}`))));
  }

  const LazyComp = lazy(importer);
  return withSuspense(<LazyComp />);
};

// ---------- core transformer ----------
function normalizePath(p?: string): string {
  if (!p) return '';
  return p.replace(/^\//, ''); // top-level array already; Router treats no leading slash as fine
}

function toRouteObject(node: BackendRoute, resolver: ComponentResolver): RouteObject {
  const meta: RouteMeta = {
    title: node.meta?.title,
    icon: node.meta?.icon,
    link: node.meta?.link ?? null,
    alwaysShow: node.alwaysShow,
    hidden: node.hidden
  };

  const element = resolver(node.component, meta);

  const route: RouteObject = {
    path: normalizePath(node.path),
    element,
    handle: { meta }
  };

  if (node.children?.length) {
    route.children = node.children.map((child) => toRouteObject(child, resolver));
  }

  // Optional: if backend provides an actual redirect (not 'noRedirect'),
  // you could add an index child that redirects.
  // Example (uncomment if you use redirects):
  // if (node.redirect && node.redirect !== 'noRedirect') {
  //   route.children = route.children ?? []
  //   route.children.unshift({
  //     index: true,
  //     loader: () => redirect(normalizePath(node.redirect)),
  //   })
  // }

  return route;
}

// ---------- public API ----------
/**
 * Merge whiteList (already-constructed RouteObject[]) with backend JSON route schema.
 * @param whiteList predefined routes (e.g., login/register)
 * @param backend backend JSON route list
 * @param resolver optional custom resolver for component strings
 */
export function mergeRoute(whiteList: RouteObject[], backend: BackendRoute[], resolver: ComponentResolver = defaultResolver): RouteObject[] {
  const backendRoutes = backend.map((node) => toRouteObject(node, resolver));

  // Ensure top-level backend paths don’t accidentally keep leading '/'
  backendRoutes.forEach((r) => {
    if (typeof r.path === 'string' && r.path.startsWith('/')) {
      r.path = r.path.slice(1);
    }
  });

  return [...whiteList, ...backendRoutes];
}
