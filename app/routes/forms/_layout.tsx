import { ArrowLeftIcon, InfoIcon } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import { requireUserMiddleware } from '~/.server/auth/middlewares'
import { cn } from '~/lib/cn'
import { AppShell } from '~/ui/app-shell'

export const middleware = [requireUserMiddleware]

export default function Layout() {
  let location = useLocation()
  let showBack = location.pathname !== '/forms'

  return (
    <AppShell mainClassName="mx-auto w-full max-w-7xl px-6 py-8 pb-12 sm:px-8 sm:pb-20">
      <StarterBanner />
      {showBack ? <BackLink /> : null}
      <Outlet />
    </AppShell>
  )
}

function StarterBanner() {
  return (
    <div className="mb-6 flex items-center gap-2 text-sm text-base-content/60">
      <InfoIcon className="size-4" />
      <span>
        <strong>Starter mode</strong> — forms and submissions are stored in
        starter-local SQLite tables.
      </span>
    </div>
  )
}

function BackLink() {
  return (
    <div className="mb-4">
      <Link
        to="/forms"
        className={cn(
          'inline-flex items-center gap-2 text-sm text-base-content/60 transition-colors hover:text-base-content',
        )}
      >
        <ArrowLeftIcon className="size-4" />
        Back to dashboard
      </Link>
    </div>
  )
}
