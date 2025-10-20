import Loadable from "components/progress/Loadable"
import { lazy, ReactElement } from "react"
import AuthGuard from "./guards/AuthGuard"
const HomePage = Loadable(lazy(() => import("views/home")))

type Route = {
  path: string
  title?: string
  element: ReactElement
}

export const PublicRoutesMap: Route[] = [
  {
    path: "/",
    title: "home",
    element: <HomePage />,
  },
]

export const AuthRoutesMap: Route[] = []

export const NoLayoutRoutesMap: Route[] = []

export const LayoutRoutesMap: Route[] = []
