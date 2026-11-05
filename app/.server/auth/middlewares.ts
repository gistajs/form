import { createContext } from 'react-router'
import type { users } from '~/.server/db/schema'
import { requireUser as requireUserCookie } from './cookie'

type User = typeof users.$inferSelect

export const userContext = createContext<User | null>(null)

export async function requireUserMiddleware({ request, context }) {
  let user = await requireUserCookie(request)
  context.set(userContext, user)
}

export function requireUser(context) {
  return getOrThrow<User>(context, userContext)
}

function getOrThrow<T>(context: any, key: any): T {
  let value = context.get(key)
  if (!value) throw new Error(`middleware: ${key} not found in context`)
  return value
}
