import Loadable from 'components/progress/Loadable';
import { lazy, ReactElement } from 'react';
import AuthGuard from './guards/AuthGuard';
const HomePage = Loadable(lazy(() => import('views/home')));
const LoginPage = Loadable(lazy(() => import('views/login')));
const FormPage = Loadable(lazy(() => import('@/components/form')));
const UserPage = Loadable(lazy(() => import('@/views/user')));

type Route = {
  path: string;
  title?: string;
  element: ReactElement;
};

export const PublicRoutesMap: Route[] = [
  {
    path: '/',
    title: 'home',
    element: <HomePage />
  },
  {
    path: '/login',
    title: 'login',
    element: <LoginPage />
  },
  {
    path: '/form',
    title: 'form',
    element: <FormPage />
  },
  {
    path: '/user',
    title: 'user',
    element: <UserPage />
  }
];

export const AuthRoutesMap: Route[] = [];

export const NoLayoutRoutesMap: Route[] = [];

export const LayoutRoutesMap: Route[] = [];
