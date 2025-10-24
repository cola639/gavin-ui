// RouteFactory.tsx. follow the same pattern to add loader or action later if needed
import ErrorBoundary from '@/components/errorBoundary';
import type { ReactElement } from 'react';
import AuthGuard from './guards/AuthGuard';

type ChildDef =
  | ReturnType<typeof makeRoute> // already built by factory
  | { path?: string; index?: boolean; element: ReactElement; auth?: boolean; title?: string; children?: ChildDef[]; errorElement?: ReactElement };

export type MakeRouteOptions = {
  title?: string;
  auth?: boolean; // if undefined, inherit from parent (default false)
  children?: ChildDef[];
  errorElement?: ReactElement;
};

export function makeRoute(path: string | undefined, element: ReactElement, opts: MakeRouteOptions = {}, parentAuth = false) {
  const effectiveAuth = opts.auth ?? parentAuth;
  const wrapped = effectiveAuth ? <AuthGuard>{element}</AuthGuard> : element;

  const route: any = {
    ...(path ? { path } : { index: true }),
    element: wrapped,
    errorElement: opts.errorElement ?? <ErrorBoundary />,
    handle: { title: opts.title }
  };

  if (opts.children?.length) {
    route.children = opts.children.map((child) => {
      // If the child already came from makeRoute, just pass it through
      if ('handle' in (child as any) || ('errorElement' in (child as any) && !('auth' in (child as any)))) {
        return child;
      }
      // Rebuild child with inherited auth unless child.auth is provided
      const c = child as any;
      return makeRoute(
        c.path, // undefined means index child
        c.element,
        {
          title: c.title,
          auth: c.auth ?? effectiveAuth,
          children: c.children,
          errorElement: c.errorElement
        },
        effectiveAuth
      );
    });
  }

  return route;
}
