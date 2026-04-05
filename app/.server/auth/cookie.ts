import { assert } from 'es-toolkit'
import { createCookieSessionStorage, redirect } from 'react-router'
import {
  redirectWithSuccess,
  replaceWithSuccess,
  replaceWithWarning,
} from 'remix-toast'
import type { users } from '~/.server/db/schema'
import { starter } from '~/config/starter'
import { User } from '~/models/.server/user'

let secret = process.env.COOKIE_SECRET || ''
assert(secret.length >= 32, 'COOKIE_SECRET must be at least 32 characters')

const USER_ID_KEY = 'user_id'

type SessionDataType = {
  [USER_ID_KEY]?: string
  oauth_state?: string
  oauth_verifier?: string
  redirect_to?: string
}

type UserType = typeof users.$inferSelect

const DefaultCookie = createCookieSessionStorage<SessionDataType>({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    secrets: [secret],
    secure: process.env.NODE_ENV === 'production',
  },
})

async function getSession(request: Request) {
  let cookie = request.headers.get('Cookie')
  return DefaultCookie.getSession(cookie)
}

export async function getSessionValue(
  request: Request,
  key: keyof SessionDataType,
) {
  let session = await getSession(request)
  return session.get(key)
}

export async function setCookie(
  request: Request,
  data: SessionDataType,
  headers?: Headers,
) {
  headers ??= new Headers()

  let session = await getSession(request)

  for (let key in data) {
    let value = data[key]
    if (value === undefined) {
      session.unset(key as any)
    } else {
      session.set(key as any, value)
    }
  }

  headers.append('Set-Cookie', await DefaultCookie.commitSession(session))
  return headers
}

function redirectToLogin(request: Request, redirect_to?: string) {
  redirect_to ??= new URL(request.url).pathname
  let searchParams = new URLSearchParams([['redirect_to', redirect_to]])
  return redirect(`/login?${searchParams}`)
}

export async function getUser(request: Request) {
  let public_id = await getSessionValue(request, USER_ID_KEY)
  if (!public_id) return
  return await User.findBy({ public_id })
}

export async function requireUser(request: Request) {
  let user = await getUser(request)
  if (!user) throw redirectToLogin(request)
  return user
}

export async function requireLoggedOut(request: Request) {
  let public_id = await getSessionValue(request, USER_ID_KEY)
  if (public_id) {
    throw await replaceWithWarning(starter.signedInHome, 'Already logged in')
  }
}

export async function login(
  request: Request,
  user: UserType,
  { redirect_to = '', toast = 'Logged in!' } = {},
) {
  let headers = await setCookie(request, {
    [USER_ID_KEY]: user.public_id,
    oauth_state: undefined,
    oauth_verifier: undefined,
    redirect_to: undefined,
  })

  redirect_to ||= starter.signedInHome
  let path = safeRedirect(redirect_to)
  return replaceWithSuccess(path, toast, { headers })
}

export async function logout(request: Request) {
  let session = await getSession(request)
  return redirectWithSuccess(starter.logoutRedirect, 'Logged out!', {
    headers: {
      'Set-Cookie': await DefaultCookie.destroySession(session),
    },
  })
}

function safeRedirect(to: unknown, defaultRedirect = starter.signedInHome) {
  if (typeof to !== 'string') return defaultRedirect
  if (!to || !to.startsWith('/') || to.startsWith('//')) return defaultRedirect
  return to
}
