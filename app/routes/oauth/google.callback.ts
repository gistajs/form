import { getUser, login } from '~/.server/auth/cookie'
import { OAuthError } from '~/.server/oauth'
import {
  getCallbackParams,
  handleOauthLink,
  handleOauthRedirect,
  loginOrCreateOauthUser,
  OAuthLinkError,
} from './+/callback'
import { auth } from './+/google'

export async function loader({ request }) {
  let params = await getCallbackParams(request, true)
  if (params.status !== 'success') {
    return await handleOauthRedirect(request, params.status, params.redirect_to)
  }
  let { code, oauth_verifier, redirect_to } = params

  try {
    let profile = await auth.getIdentity(code, oauth_verifier!)
    let { email, name } = profile
    let google = { id: profile.id, image_url: profile.imageUrl }

    let currentUser = await getUser(request)
    if (currentUser) {
      return await handleOauthLink(request, currentUser, {
        email,
        name,
        redirect_to,
        provider: 'Google',
        path: 'bag.auth.google',
        data: google,
        success: 'Google connected!',
      })
    }

    let user = await loginOrCreateOauthUser({
      email,
      name,
      path: 'bag.auth.google',
      data: google,
      bag: { auth: { google } },
    })

    return await login(request, user, {
      redirect_to,
      toast: 'Successfully logged in',
    })
  } catch (error) {
    if (!(error instanceof OAuthError) && !(error instanceof OAuthLinkError))
      throw error
    return handleOauthRedirect(
      request,
      error instanceof OAuthLinkError ? error : 'failed',
      redirect_to,
    )
  }
}
