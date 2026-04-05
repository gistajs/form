import { login } from '~/.server/auth/cookie'
import { User } from '~/models/.server/user'
import { getCallbackParams, handleOauthRedirect } from './+/callback'
import { auth } from './+/github'

export async function loader({ request }) {
  let params = await getCallbackParams(request)
  if (params.status !== 'success') {
    return await handleOauthRedirect(request, params.status)
  }
  let { code, redirect_to } = params

  let tokens = await auth.validateAuthorizationCode(code)
  let headers = {
    Authorization: `Bearer ${tokens.accessToken()}`,
  }

  let response = await fetch('https://api.github.com/user', { headers })
  let profile = await response.json()

  let email = profile?.email
  let name = profile?.name || profile?.login
  let github = {
    id: profile.id,
    login: profile.login,
    image_url: profile.avatar_url,
  }

  if (!email) {
    let emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers,
    })
    let emails = await emailsResponse.json()
    if (Array.isArray(emails)) {
      let primary = emails.find((entry) => entry.primary) || emails[0]
      email = primary?.email
    }
  }

  if (!email) {
    throw new Error(
      'Unable to get email from GitHub. Make sure your email is accessible.',
    )
  }

  let user = await User.findByEmail(email)
  if (!user) {
    user = await User.create({
      email,
      name,
      verified_at: new Date(),
      bag: { auth: { github } },
    })
  } else {
    if (!user.verified_at || (!user.name && name)) {
      user = await User.update(user.id, {
        ...(!user.verified_at && { verified_at: new Date() }),
        ...(!user.name && name && { name }),
      })
    }
    await User.updateJson(user, 'bag.auth.github', github)
  }

  return await login(request, user, {
    redirect_to,
    toast: 'Successfully logged in',
  })
}
