import { useRoutes } from 'react-router-dom';
import { NotFound, RedirectNotFound } from './404';
import { AuthRoutesMap, LayoutRoutesMap, NoLayoutRoutesMap, PublicRoutesMap } from './RoutesMap';

const PublicRoutes = {
  path: '/',
  children: PublicRoutesMap
};

const AuthRoutes = {
  path: '/',
  children: NoLayoutRoutesMap
};

export default function Routes() {
  return useRoutes([PublicRoutes, AuthRoutes, RedirectNotFound, NotFound]);
}
