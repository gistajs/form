import { redirectWithError } from 'remix-toast'
import { User } from '~/models/.server/user'

export async function requireUserByToken(token: string) {
  let user = await User.findBy({ token })
  if (!user) throw await redirectWithError('/', 'Invalid token')
  return user
}

export function logAuthLink(path: string) {
  let origin = process.env.ORIGIN || 'http://localhost:5173'
  let url = new URL(path, origin)
  console.log(`[auth-link] ${url.toString()}`)
}
