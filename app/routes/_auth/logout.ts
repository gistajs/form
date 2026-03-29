import { redirect } from 'react-router'
import { logout } from '~/.server/auth/cookie'
import { starter } from '~/config/starter'

export async function action({ request }) {
  return await logout(request)
}

export async function loader() {
  return redirect(starter.logoutRedirect)
}
