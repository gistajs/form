import { login } from '~/.server/auth/cookie'
import { User } from '~/models/.server/user'
import { getCallbackParams, handleOauthRedirect } from './+/callback'
import { auth } from './+/google'

export async function loader({ request }) {
  let params = await getCallbackParams(request, true)
  if (params.status !== 'success') {
    return await handleOauthRedirect(request, params.status)
  }
  let { code, oauth_verifier, redirect_to } = params

  let tokens = await auth.validateAuthorizationCode(code, oauth_verifier!)

  let response = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    { headers: { Authorization: `Bearer ${tokens.accessToken()}` } },
  )

  let profile = await response.json()
  let email = profile?.email
  let name = profile?.name || profile?.given_name || profile?.email
  let google = {
    id: profile.sub,
    image_url: profile.picture,
  }

  if (!email) throw new Error('Unable to get email from Google')

  let user = await User.findByEmail(email)
  if (!user) {
    user = await User.create({
      email,
      name,
      verified_at: new Date(),
      bag: { auth: { google } },
    })
  } else {
    if (!user.verified_at || (!user.name && name)) {
      user = await User.update(user.id, {
        ...(!user.verified_at && { verified_at: new Date() }),
        ...(!user.name && name && { name }),
      })
    }
    await User.updateJson(user, 'bag.auth.google', google)
  }

  return await login(request, user, {
    redirect_to,
    toast: 'Successfully logged in',
  })
}
