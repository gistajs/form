import { Link } from 'react-router'
import { replaceWithSuccess } from 'remix-toast'
import { login, requireLoggedOut } from '~/.server/auth/cookie'
import { userUpdateSchema } from '~/.server/db/validators'
import { getSearchParam } from '~/lib/.server/url'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { User } from '~/models/.server/user'
import { AuthForm, Trailing } from './+/auth-form'
import { sendAuthLink } from './+/helpers.server'

export async function loader({ request }) {
  await requireLoggedOut(request)
}

export async function action({ request }) {
  let payload = await payloadFromRequest(request)
  let { data, errors } = validate(payload, userUpdateSchema)
  if (errors) return { errors }

  let { email, password } = data
  let user = await User.authenticate(email!, password as string)
  if (!user) return { errors: { email: ['Invalid email or password'] } }

  if (!user.verified_at) {
    user = await User.refreshToken(user.id)
    let sent = await sendAuthLink(
      user.email,
      `/verify/${user.token}`,
      'verify',
      user.name,
    )
    return replaceWithSuccess(
      `/verify?sent=${encodeURIComponent(user.email)}`,
      sent
        ? 'Please verify your email first. Check your email for a new link.'
        : 'Please verify your email first. Check server logs for your verification link.',
    )
  }

  let redirect_to = getSearchParam(request, 'redirect_to')
  return await login(request, user, { redirect_to })
}

export default function Page() {
  return (
    <>
      <AuthForm
        heading="Log in"
        // oauth={['google', 'github']}
        fields={['email', 'password']}
        forgot
        submit="Login"
      />
      <Trailing>
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="link font-semibold link-primary link-hover"
        >
          Sign up
        </Link>
      </Trailing>
    </>
  )
}
