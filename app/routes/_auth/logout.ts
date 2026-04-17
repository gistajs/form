import { redirect } from 'react-router'
import { logout } from '~/.server/auth/cookie'

export async function action({ request }) {
  return await logout(request)
}

export async function loader() {
  return redirect('/')
}
