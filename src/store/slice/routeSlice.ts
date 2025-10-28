// src/store/slice/routeSlice.tsx
// Ensure this file is named routeSlice.tsx for JSX support
import { isInWhitelist, whiteList } from '@/routes'; // export from your routes module
import type { BackendRoute } from '@/routes/RouteFactory';
import { mergeRoute } from '@/routes/RouteFactory';
import { fetchRoutes } from '@/routes/routes';
import NotFound from '@/views/404'; // Make sure NotFound is a React component
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Router as RemixRouter } from '@remix-run/router';
import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { getToken } from 'utils/auth';
import { dispatch } from '../index';

type RouteState = {
  routes: any | null;
  loading: boolean;
  error?: string;
};

const initialState: RouteState = {
  routes: null,
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
    }
  }
});

export const { setLoading, setRoutes, setError } = routeSlice.actions;
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
  const merged = mergeRoute(whiteList, backend);
  // @ts-ignore
  return createBrowserRouter([...merged, { path: '*', element: NotFound }]);
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
