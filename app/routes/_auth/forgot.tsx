import { Undo2 } from 'lucide-react'
import { Link, redirect } from 'react-router'
import { requireLoggedOut } from '~/.server/auth/cookie'
import { userUpdateSchema } from '~/.server/db/validators'
import { getSearchParam } from '~/lib/.server/url'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { User } from '~/models/.server/user'
import { AuthForm, Trailing } from './+/auth-form'
import { logAuthLink } from './+/helpers.server'

export async function loader({ request }) {
  await requireLoggedOut(request)
  let sent = getSearchParam(request, 'sent')
  return { sent }
}

export async function action({ request }) {
  let payload = await payloadFromRequest(request)
  let { data, errors } = validate(payload, userUpdateSchema)
  if (errors) return { errors }

  let email = data.email!
  let user = await User.findByEmail(email)

  if (user) {
    user = await User.refreshToken(user.id)
    logAuthLink(`/reset-password/${user.token}`)
  }

  return redirect(`/forgot?sent=${encodeURIComponent(email)}`)
}

export default function Page({ loaderData: { sent } }) {
  if (sent) {
    return (
      <>
        <AuthForm heading="Check your email">
          Please check the email address <strong>{sent}</strong> for
          instructions to reset your password.
        </AuthForm>
        <Return to="/forgot">Resend email</Return>
      </>
    )
  }

  return (
    <>
      <AuthForm
        heading="Forgot password?"
        fields={['email']}
        submit="Send link"
      >
        Enter your email. We'll send you a link to reset password.
      </AuthForm>
      <Return to="/login">Return to login</Return>
    </>
  )
}

function Return({ to, children }) {
  return (
    <Trailing>
      <Link to={to} className="text-base-content/60 hover:text-base-content/80">
        <Undo2 className="mr-2 inline size-4" />
        {children}
      </Link>
    </Trailing>
  )
}
