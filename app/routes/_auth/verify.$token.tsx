import { Form } from 'react-router'
import { redirectWithError } from 'remix-toast'
import { getSessionValue, login } from '~/.server/auth/cookie'
import { tokenExpired, User } from '~/models/.server/user'
import { Heading } from './+/auth-form'

export async function loader({ params }) {
  let user = await User.findBy({ token: params.token })
  if (!user || tokenExpired(user))
    throw await redirectWithError('/', 'Invalid token')
  return { user }
}

export async function action({ request, params }) {
  let user = await User.verify(params.token)
  if (!user) throw await redirectWithError('/', 'Invalid token')
  let redirect_to = await getSessionValue(request, 'redirect_to')
  return await login(request, user, { redirect_to, toast: 'Logged in!' })
}

export default function Page({ loaderData: { user } }) {
  return (
    <div className="space-y-6">
      <Heading>Email verified</Heading>
      <p>
        Your email <strong>{user.email}</strong> is verified. You can now finish
        login.
      </p>
      <Form method="post" replace>
        <button className="btn w-full btn-primary">Finish login</button>
      </Form>
    </div>
  )
}
