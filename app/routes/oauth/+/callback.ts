import {
  redirectWithError,
  redirectWithSuccess,
  redirectWithWarning,
} from 'remix-toast'
import {
  getSessionValue,
  getUser,
  safeRedirect,
  setCookie,
} from '~/.server/auth/cookie'
import type { Select as User } from '~/.server/db/schema/users'
import { User as UserModel } from '~/models/.server/user'

export class OAuthLinkError extends Error {}

export async function getCallbackParams(request: Request, pkce = false) {
  let url = new URL(request.url)
  let code = url.searchParams.get('code')
  let error = url.searchParams.get('error')
  let state = url.searchParams.get('state')
  let redirect_to = await getSessionValue(request, 'redirect_to')

  let oauth_state = await getSessionValue(request, 'oauth_state')
  let oauth_verifier = pkce
    ? await getSessionValue(request, 'oauth_verifier')
    : undefined

  if (!state || !oauth_state || state !== oauth_state) {
    return { status: 'invalid', redirect_to } as const
  }
  if (error === 'access_denied') {
    return { status: 'cancelled', redirect_to } as const
  }
  if (error || !code || (pkce && !oauth_verifier)) {
    return { status: 'invalid', redirect_to } as const
  }

  return { status: 'success', code, oauth_verifier, redirect_to } as const
}

export async function clearOauth(request: Request, headers?: Headers) {
  return await setCookie(
    request,
    {
      oauth_state: undefined,
      oauth_verifier: undefined,
      redirect_to: undefined,
    },
    headers,
  )
}

export async function handleOauthRedirect(
  request: Request,
  status: CallbackStatus | OAuthLinkError,
  redirect_to?: string,
) {
  let headers = await clearOauth(request)
  let user = await getUser(request)
  let fallback = user ? '/app' : '/login'
  let path = safeRedirect(redirect_to, fallback)

  if (status === 'cancelled') {
    return redirectWithWarning(path, 'Sign in canceled.', { headers })
  }

  return redirectWithError(
    path,
    status instanceof OAuthLinkError
      ? status.message
      : status === 'failed'
        ? 'Unable to sign in with this account. Please check your verified email and account connection.'
        : 'Your login session expired. Please try again.',
    { headers },
  )
}

export async function handleOauthLink(
  request: Request,
  currentUser: User,
  {
    email,
    name,
    redirect_to,
    provider,
    path,
    data,
    success,
  }: HandleOauthLinkOptions,
) {
  let target = safeRedirect(redirect_to)

  if (currentUser.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    let headers = await clearOauth(request)
    return redirectWithError(
      target,
      `This ${provider} account uses a different email address`,
      {
        headers,
      },
    )
  }

  assertMatchingProviderId(currentUser, path, data)

  if (!currentUser.verified_at || (!currentUser.name && name)) {
    currentUser = await UserModel.update(currentUser.id, {
      ...(!currentUser.verified_at && { verified_at: new Date() }),
      ...(!currentUser.name && name && { name }),
    })
  }
  await UserModel.updateJson(currentUser, path, data)

  let headers = await clearOauth(request)
  return redirectWithSuccess(target, success, { headers })
}

export async function loginOrCreateOauthUser({
  email,
  name,
  path,
  data,
  bag,
}: LoginOrCreateOauthUserOptions) {
  let user = await UserModel.findByEmail(email)

  if (!user) {
    return await UserModel.create({
      email,
      name,
      verified_at: new Date(),
      bag,
    })
  }

  assertMatchingProviderId(user, path, data)

  if (!user.verified_at || (!user.name && name)) {
    user = await UserModel.update(user.id, {
      ...(!user.verified_at && { verified_at: new Date() }),
      ...(!user.name && name && { name }),
    })
  }

  await UserModel.updateJson(user, path, data)
  return user
}

type HandleOauthLinkOptions = {
  email: string
  name?: string | null
  redirect_to: string | null | undefined
  provider: 'Google' | 'GitHub'
  path: 'bag.auth.google' | 'bag.auth.github'
  data: any
  success: string
}

type LoginOrCreateOauthUserOptions = {
  email: string
  name?: string | null
  path: 'bag.auth.google' | 'bag.auth.github'
  data: any
  bag: any
}

type CallbackStatus = 'cancelled' | 'invalid' | 'failed'

function assertMatchingProviderId(
  user: User,
  path: HandleOauthLinkOptions['path'],
  data: { id: string | number },
) {
  let provider = path === 'bag.auth.google' ? 'google' : 'github'
  let existingId = user.bag?.auth?.[provider]?.id
  if (existingId != null && existingId !== data.id) {
    throw new OAuthLinkError(
      'A different provider account is already connected',
    )
  }
}
