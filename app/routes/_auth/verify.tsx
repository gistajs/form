import { Link } from 'react-router'
import { getSearchParam } from '~/lib/.server/url'
import { Heading } from './+/auth-form'

export async function loader({ request }) {
  let sent = getSearchParam(request, 'sent')
  return { sent }
}

export default function Page({ loaderData: { sent } }) {
  return (
    <div className="space-y-6">
      <Heading>Verify your email</Heading>
      <p>
        We sent an email to <strong>{sent}</strong>. Use the verification link
        from your local server logs.
      </p>
      <p>
        If you don't receive a link, try logging in again to regenerate one.
        <br />
        <Link to="/login" className="link">
          Return to login
        </Link>
      </p>
    </div>
  )
}
