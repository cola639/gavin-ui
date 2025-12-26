// src/store/slice/routeSlice.ts
// Ensure this file is named routeSlice.tsx for JSX support
import { constRoutes, isInWhitelist, whiteList } from '@/routes'; // export from your routes module
import type { BackendRoute } from '@/routes/RouteFactory';
import { mergeRoutes } from '@/routes/RouteFactory';
import { fetchRoutes } from '@/routes/routes';
import NotFound from '@/views/404'; // Make sure NotFound is a React component
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Router as RemixRouter } from '@remix-run/router';
import * as React from 'react';
import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { getToken } from 'utils/auth';
import { dispatch } from '../index';
// MenuItem for your Sidebar
import type { LucideIcon } from 'lucide-react';
import {
  AlarmClockCheck,
  Archive,
  BarChart3,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Heart,
  Inbox,
  LayoutDashboard,
  List,
  LogOut,
  Monitor,
  Package,
  Settings,
  ShoppingCart,
  Table,
  User as UserIcon,
  UserPlus,
  Users
} from 'lucide-react';

type RouteState = {
  routes: any | null;
  menu: MenuItem[];
  loading: boolean;
  error?: string;
};

const initialState: RouteState = {
  routes: null,
  menu: [],
  loading: true
};

const routeSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRoutes(state, action: PayloadAction<any | null>) {
      state.routes = action.payload;
    },
    setError(state, action: PayloadAction<string | undefined>) {
      state.error = action.payload;
    },
    setMenus(state, action: PayloadAction<MenuItem[] | null>) {
      state.menu = action.payload;
    }
  }
});

export const { setLoading, setRoutes, setError, setMenus } = routeSlice.actions;
export default routeSlice.reducer;

// ---------- helpers ----------
const toLogin = (from: string) => `/login?redirect=${encodeURIComponent(from)}`;
const loginRedirectLoader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const from = url.pathname + url.search;
  if (url.pathname.startsWith('/login')) return redirect('/login');
  return redirect(toLogin(from));
};

// ---------- async functions (no createAsyncThunk) ----------
export async function buildAppRouter(): Promise<RemixRouter> {
  const backend: BackendRoute[] = await fetchRoutes();
  const menuItems = routesToMenuItems(backend, {
    labelFrom: 'name',
    useRelativePath: false,
    sectionMode: 'first' // <= only the first child gets section
  });

  menuItems.unshift({
    id: 'dashboard',
    label: 'Home',
    icon: 'dashboard', // string, matches assets/icons/dashboard.svg
    path: '/dashboard'
  });
  menuItems.push({
    id: 'logout',
    label: 'Logout',
    icon: 'logout',
    path: '',
    onClick: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  });
  dispatch(setMenus(menuItems));

  const merged = mergeRoutes(whiteList, constRoutes, backend);
  return createBrowserRouter([...merged, { path: '*', element: React.createElement(NotFound) }]);
}

export async function initRoutes() {
  const pathname = window.location.pathname;

  if (isInWhitelist(pathname)) {
    // only whitelist; everything else -> /login?redirect=...
    return createBrowserRouter([...whiteList, { path: '*', loader: loginRedirectLoader }]);
  }

  if (getToken()) {
    // authed: build full app routes (fetch backend)
    return buildAppRouter();
  }

  // no token; index and everything -> /login?redirect=...
  return createBrowserRouter([{ index: true, loader: loginRedirectLoader }, ...whiteList, { path: '*', loader: loginRedirectLoader }]);
}

// ---------- exported async actions you can call directly ----------
export async function buildAppRoutes(): Promise<RemixRouter> {
  dispatch(setLoading(true));
  try {
    const router = await buildAppRouter();
    dispatch(setRoutes(router));
    return router;
  } catch (e: any) {
    dispatch(setError(e?.message));
  } finally {
    dispatch(setLoading(false));
  }
}

export async function buildFirstRoutes() {
  dispatch(setLoading(true));
  try {
    const router = await initRoutes();
    try {
      dispatch(setRoutes(router));
    } catch (error) {}
  } catch (e: any) {
    dispatch(setError(e?.message));
  } finally {
    dispatch(setLoading(false));
  }
}

export type MenuItem = {
  id: string;
  label: string;
  icon?: string | LucideIcon;
  path: string;
  section?: string;
  onClick?: () => void;
};

const iconMap: Record<string, LucideIcon> = {
  user: UserIcon,
  users: Users,
  order: ShoppingCart,
  orders: ShoppingCart,
  list: List,
  monitor: Monitor,
  settings: Settings,
  dashboard: LayoutDashboard,
  package: Package,
  heart: Heart,
  inbox: Inbox,
  archive: Archive,
  dollar: DollarSign,
  calendar: Calendar,
  todo: CheckSquare,
  contact: Users,
  invoice: FileText,
  chart: BarChart3,
  team: UserPlus,
  table: Table,
  logout: LogOut
};

const normalizeIcon = (s?: string | null) => (s || '').trim().toLowerCase() || undefined;

export function routesToMenuItems(
  routes: BackendRoute[],
  opts?: {
    labelFrom?: 'path' | 'name' | 'meta.title';
    useRelativePath?: boolean;
    /** include section on: only first child (default), all children, or none */
    sectionMode?: 'first' | 'all' | 'none';
  }
): MenuItem[] {
  const labelFrom = opts?.labelFrom ?? 'name';
  const useRelativePath = opts?.useRelativePath ?? false;
  const sectionMode = opts?.sectionMode ?? 'first';

  const out: MenuItem[] = [];
  const seen = new Set<string>(); // dedupe by full path

  for (const parent of routes ?? []) {
    const parentSection = parent.name ?? '';
    const children = parent.children ?? [];
    let isFirst = true;

    for (const child of children) {
      if (child.hidden) continue;

      const id = child.path; // or child.name
      const label = labelFrom === 'meta.title' ? child.meta?.title ?? child.path : labelFrom === 'name' ? child.name ?? child.path : child.path;

      const icon = normalizeIcon(child.meta?.icon);
      const fullPath = joinFullPath(parent.path, child.path);
      const path = useRelativePath ? child.path : fullPath;

      // dedupe duplicates (e.g., repeated 'configure' or 'user')
      if (seen.has(fullPath)) continue;
      seen.add(fullPath);

      const section = sectionMode === 'all' ? parentSection : sectionMode === 'first' ? (isFirst ? parentSection : undefined) : undefined;

      out.push({
        id,
        label,
        path,
        ...(icon ? ({ icon } as const) : {}),
        ...(section ? ({ section } as const) : {})
      });

      isFirst = false;
    }
  }

  return out;
}
function joinFullPath(parent: string, child: string) {
  const p = parent?.endsWith('/') ? parent.slice(0, -1) : parent;
  const c = child?.startsWith('/') ? child.slice(1) : child;
  let s = `${p}/${c}`.replace(/\/{2,}/g, '/');
  if (!s.startsWith('/')) s = '/' + s;
  return s;
}
