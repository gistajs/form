import { redirectWithError, redirectWithWarning } from 'remix-toast'
import { getSessionValue, getUser, setCookie } from '~/.server/auth/cookie'
import { starter } from '~/config/starter'

export async function getCallbackParams(request: Request, pkce = false) {
  let url = new URL(request.url)
  let code = url.searchParams.get('code')
  let error = url.searchParams.get('error')
  let state = url.searchParams.get('state')
  let redirect_to = await getSessionValue(request, 'redirect_to')

  if (error === 'access_denied') {
    return { status: 'cancelled', redirect_to } as const
  }

  let oauth_state = await getSessionValue(request, 'oauth_state')
  let oauth_verifier = pkce
    ? await getSessionValue(request, 'oauth_verifier')
    : undefined

  if (!code || state !== oauth_state || (pkce && !oauth_verifier)) {
    return { status: 'invalid', redirect_to } as const
  }

  return { status: 'success', code, oauth_verifier, redirect_to } as const
}

export async function handleOauthRedirect(
  request: Request,
  status: CallbackStatus,
) {
  let headers = await setCookie(request, {
    oauth_state: undefined,
    oauth_verifier: undefined,
    redirect_to: undefined,
  })

  let user = await getUser(request)
  let path = user
    ? starter.oauthFallbackSignedIn
    : starter.oauthFallbackSignedOut

  if (status === 'cancelled') {
    return redirectWithWarning(path, 'Sign in canceled.', { headers })
  }

  return redirectWithError(
    path,
    'Your login session expired. Please try again.',
    {
      headers,
    },
  )
}

type CallbackStatus = 'cancelled' | 'invalid'
