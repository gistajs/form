import { Form, Link, useSearchParams } from 'react-router'
import { useBusy } from '~/hooks/use-busy'
import { InputError } from '~/ui/forms/input-error'

export function AuthForm({
  heading = '',
  oauth = [] as ('google' | 'github')[],
  fields = [] as ('name' | 'email' | 'password')[],
  newPassword = false,
  forgot = false,
  submit = '',
  children = null as any,
}) {
  let busy = useBusy()
  let [searchParams] = useSearchParams()
  let redirect_to = searchParams.get('redirect_to')

  return (
    <div className="space-y-4">
      {heading && (
        <h2 className="text-center text-2xl leading-9 font-bold tracking-tight">
          {heading}
        </h2>
      )}
      {children && <div className="text-center text-sm">{children}</div>}

      {oauth.length > 0 && (
        <div className="space-y-4">
          {oauth.includes('google') && (
            <Form action="/oauth/google" replace>
              {redirect_to && (
                <input type="hidden" name="redirect_to" value={redirect_to} />
              )}
              <button className="btn w-full">
                <img src="/google.png" alt="Google" className="mr-2 size-6" />
                Continue with Google
              </button>
            </Form>
          )}

          {oauth.includes('github') && (
            <Form action="/oauth/github" replace>
              {redirect_to && (
                <input type="hidden" name="redirect_to" value={redirect_to} />
              )}
              <button className="btn w-full">
                <img
                  src="/github.svg"
                  alt="GitHub"
                  className="mr-2 size-6 dark:invert"
                />
                Continue with GitHub
              </button>
            </Form>
          )}

          <div className="divider">OR</div>
        </div>
      )}

      <Form method="post" replace className="space-y-4">
        {fields.includes('name') && (
          <div className="space-y-2">
            <input
              className="input w-full"
              name="name"
              type="text"
              placeholder="Full name"
              autoComplete="name"
            />
            <InputError name="name" />
          </div>
        )}

        {fields.includes('email') && (
          <div className="space-y-2">
            <input
              className="input w-full"
              name="email"
              type="text"
              placeholder="Email"
              autoComplete="email"
            />
            <InputError name="email" />
          </div>
        )}

        {fields.includes('password') && (
          <div className="space-y-2">
            <input
              className="input w-full"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete={newPassword ? 'new-password' : 'current-password'}
            />
            <InputError name="password" />
          </div>
        )}

        {forgot && (
          <div className="text-right text-sm">
            <Link
              to="/forgot"
              className="text-base-content/60 hover:text-base-content/80"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {submit && (
          <div className="flex justify-center">
            <button className="btn w-full btn-primary" disabled={busy}>
              {busy ? 'Processing...' : submit}
            </button>
          </div>
        )}
      </Form>
    </div>
  )
}

export function Heading({ children }) {
  return (
    <h2 className="text-center text-2xl leading-9 font-bold tracking-tight">
      {children}
    </h2>
  )
}

export function Trailing({ children }) {
  return (
    <p className="mt-4 text-center text-sm text-base-content/60">{children}</p>
  )
}
