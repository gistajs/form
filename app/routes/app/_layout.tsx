import { Outlet } from 'react-router'
import { requireUserMiddleware } from '~/.server/auth/middlewares'

export const middleware = [requireUserMiddleware]

export default function Layout() {
  return <Outlet />
}
