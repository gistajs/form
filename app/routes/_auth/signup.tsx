import { Link } from 'react-router'
import { redirectWithSuccess } from 'remix-toast'
import { requireLoggedOut, setCookie } from '~/.server/auth/cookie'
import { userInsertSchema } from '~/.server/db/validators'
import { getSearchParam } from '~/lib/.server/url'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { matchesCode } from '~/models/.server/base/error'
import { User } from '~/models/.server/user'
import { AuthForm, Trailing } from './+/auth-form'
import { logAuthLink } from './+/helpers.server'

export async function loader({ request }) {
  await requireLoggedOut(request)
}

export async function action({ request }) {
  let payload = await payloadFromRequest(request)
  let { data, errors } = validate(payload, userInsertSchema)
  if (errors) return { errors }

  let { email, name, password } = data
  let redirect_to = getSearchParam(request, 'redirect_to')

  let user = await User.findByEmail(email!)

  if (!user) {
    try {
      user = await User.create({ email, name, password })
    } catch (error) {
      if (matchesCode(error, ['SQLITE_CONSTRAINT_UNIQUE'])) {
        return { errors: { email: ['Email already exists'] } }
      }
      throw error
    }
  } else if (user.verified_at) {
    return { errors: { email: ['Email already exists'] } }
  } else {
    user = await User.refreshToken(user.id)
  }

  logAuthLink(`/verify/${user.token}`)

  let headers = redirect_to
    ? await setCookie(request, { redirect_to })
    : undefined

  return redirectWithSuccess(
    `/verify?sent=${encodeURIComponent(user.email)}`,
    'Account created. Check server logs for your verification link.',
    { headers },
  )
}

export default function Page() {
  return (
    <>
      <AuthForm
        heading="Sign up"
        // oauth={['google', 'github']}
        fields={['name', 'email', 'password']}
        newPassword
        submit="Sign up"
      />
      <Trailing>
        Already have an account?{' '}
        <Link
          to="/login"
          className="link font-semibold link-primary link-hover"
        >
          Log in
        </Link>
      </Trailing>
    </>
  )
}
