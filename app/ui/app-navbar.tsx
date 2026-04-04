import { FileTextIcon, LogOutIcon } from 'lucide-react'
import { Form, Link } from 'react-router'
import { DarkModeSelector } from '~/features/dark/dark-mode-selector'
import { Avatar } from '~/ui/avatar'
import { useOptionalUser } from '~/ui/hooks/use-root'
import { PopoverMenu } from '~/ui/popover-menu'

export function AppNavbar() {
  let user = useOptionalUser()

  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-base-300/50 bg-base-100/45 backdrop-blur-lg">
      <div className="flex h-full items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-base-content no-underline"
        >
          <FileTextIcon className="size-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">FormKit</span>
        </Link>

        <div className="flex items-center gap-2">
          <DarkModeSelector />
          {user ? (
            <PopoverMenu
              id="app-user-menu"
              button={<Avatar user={user} className="size-8" />}
              items={[]}
            >
              <li>
                <Form method="POST" action="/logout" className="block!">
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center justify-between"
                  >
                    Log out
                    <LogOutIcon className="size-4" />
                  </button>
                </Form>
              </li>
              <li className="mt-1 border-t border-base-300 menu-title pt-3">
                <div className="min-w-0 px-2">
                  <p className="truncate text-sm font-medium text-base-content">
                    {user.name ?? 'User'}
                  </p>
                  <p className="truncate text-xs text-base-content/60">
                    {user.email}
                  </p>
                </div>
              </li>
            </PopoverMenu>
          ) : (
            <Link to="/login" className="btn btn-soft btn-sm btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
