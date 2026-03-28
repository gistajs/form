import { Form } from 'react-router'
import { redirectWithError } from 'remix-toast'
import { getSessionValue, login } from '~/.server/auth/cookie'
import { User } from '~/models/.server/user'
import { Heading } from './+/auth-form'

export async function loader({ params }) {
  return { user: await verifiedUser(params.token) }
}

export async function action({ request, params }) {
  let user = await verifiedUser(params.token)
  let redirect_to = await getSessionValue(request, 'redirect_to')
  return await login(request, user, { redirect_to, toast: 'Logged in!' })
}

async function verifiedUser(token: string) {
  let user = await User.verify(token)
  if (!user?.verified_at) throw await redirectWithError('/', 'Invalid token')
  return user
}

export default function Page({ loaderData: { user } }) {
  return (
    <div className="space-y-6">
      <Heading>Email verified</Heading>
      <p>
        Your email <strong>{user.email}</strong> is verified. You can now finish
        login.
      </p>
      <Form method="post">
        <button className="btn w-full btn-primary">Finish login</button>
      </Form>
    </div>
  )
}
