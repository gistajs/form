import { useEffect } from 'react'
import {
  data,
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'
import { getToast } from 'remix-toast'
import { toast as notify, Toaster } from 'sonner'
import { getUser } from '~/.server/auth/cookie'
import { PublicEnv } from '~/config/.server/env'
import { starter } from '~/config/starter'
import './tailwind.css'

export async function loader({ request }) {
  let { toast, headers } = await getToast(request)
  let user = await getUser(request)

  return data({ toast, user, PublicEnv }, { headers })
}

export function Layout({ children }: { children: React.ReactNode }) {
  let data = useRouteLoaderData<typeof loader>('root')
  let { toast, PublicEnv } = data ?? ({} as any)

  useEffect(() => {
    if (toast) notify[toast.type](toast.message)
  }, [toast])

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{starter.appName}</title>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <Links />
        {PublicEnv && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(PublicEnv)}`,
            }}
          />
        )}
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'w-full flex gap-2 items-center bg-base-100 p-4 rounded-lg shadow-lg text-sm border border-base-300',
              error: 'text-red-600',
              success: 'text-teal-600',
              warning: 'text-yellow-600',
              info: 'text-gray-600',
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
