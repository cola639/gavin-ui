import { buildAppRouter, initRoutes } from '@/routes';
import type { BackendRoute } from '@/routes/RouteFactory';
import { mergeRoute } from '@/routes/RouteFactory';
import { fetchRoutes } from '@/routes/routes';
import { createSlice } from '@reduxjs/toolkit';
import { getUserInfoApi, loginApi, logoutApi } from 'apis/user';
import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { getToken, removeToken, setToken } from 'utils/auth';
import { dispatch } from '../index';

interface RouteProps {
  token?: string;
  routes?: any;
}

const initialState: RouteProps = {
  token: getToken(),
  routes: initRoutes()
};

const routeSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRoutes(state, action) {}
  }
});

/**
 * async actions
 */

/** async await 写法 */
// Full app router (fetch + merge; includes whitelist)
export async function buildAppRoutes() {
  return await buildAppRouter();
}

export default routeSlice.reducer;
export const { setRoutes } = routeSlice.actions;
