import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// project imports
import Loadable from 'components/progress/Loadable'

const ErrorPage = Loadable(lazy(() => import('views/404')))

// ==============================|| MAIN ROUTING ||============================== //

export const RedirectNotFound = {
  path: '/*',
  element: <Navigate to="/404" />
}

export const NotFound = {
  path: '/404',
  element: <ErrorPage />
}
