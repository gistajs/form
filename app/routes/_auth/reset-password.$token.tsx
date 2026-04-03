import { href } from 'react-router'
import { redirectWithError } from 'remix-toast'
import { login } from '~/.server/auth/cookie'
import { userUpdateSchema } from '~/.server/db/validators'
import { validate } from '~/lib/data/validate'
import { tokenExpired, User } from '~/models/.server/user'
import { AuthForm } from './+/auth-form'
import { requireUserByToken } from './+/helpers.server'

export async function loader({ params }) {
  await requireUserByToken(params.token)
  return null
}

export async function action({ request, params }) {
  let formData = await request.formData()
  let { data, errors } = validate(formData, userUpdateSchema)
  if (errors) return { errors }

  let { password } = data
  let user = await requireUserByToken(params.token)

  if (tokenExpired(user)) {
    return redirectWithError(href('/forgot'), 'Password token expired')
  }

  await User.update(user.id, { password })
  user = (await User.verify(params.token)) || user

  return await login(request, user as any, { toast: 'Password updated' })
}

export default function Page() {
  return (
    <AuthForm
      heading="Reset your password"
      fields={['password']}
      newPassword
      submit="Reset password"
    >
      Enter a new password below to change your password.
    </AuthForm>
  )
}
