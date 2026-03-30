import { Outlet } from 'react-router'
import { cn } from '~/lib/cn'

export function AppShell({
  showNavbar = false,
  offsetContent = false,
  mainClassName,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen text-base-content">
      <main className={cn(showNavbar && '-mt-16', 'relative')}>
        <ShellInset inset={showNavbar && offsetContent}>
          <div className={mainClassName}>{children ?? <Outlet />}</div>
        </ShellInset>
      </main>
    </div>
  )
}

type AppShellProps = {
  showNavbar?: boolean
  offsetContent?: boolean
  mainClassName?: string
  children?: React.ReactNode
}

function ShellInset({ inset, children }) {
  return <div className={cn(inset && 'pt-16')}>{children}</div>
}
