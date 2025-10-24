import ErrorBoundary from '@/components/errorBoundary';
import NotFoundPage from '@/views/404';
import LoginPage from '@/views/login';
import Loadable from 'components/progress/Loadable';
import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { makeRoute } from './RouteFactory';

// Lazy pages
const LayoutComponent = Loadable(lazy(() => import('views/layout')));
const OrderPage = Loadable(lazy(() => import('@/views/order')));
const UserPage = Loadable(lazy(() => import('views/user')));

// Build route tree using factory
const routes = [
  // Redirect root to /view
  makeRoute('/', <Navigate to="/view" replace />),

  // /login (public)
  makeRoute('/login', <LoginPage />, { title: 'login' }),

  // /view (layout) with children
  makeRoute('/view', <LayoutComponent />, {
    title: 'dashboard',
    auth: false, // <- enable if layout requires auth
    children: [
      { index: true, element: <Navigate to="order" replace />, errorElement: <ErrorBoundary /> },
      makeRoute('order', <OrderPage />, { title: 'order' /*, auth: true*/ }),
      makeRoute('user', <UserPage />, { title: 'user' /*, auth: true*/ })
      // index route (optional): default child
    ]
  }),

  // 404 (catch-all)
  makeRoute('*', <NotFoundPage />)
];

// Create router ONCE at module scope
export const router = createBrowserRouter(routes);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
