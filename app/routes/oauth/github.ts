import { redirect } from 'react-router'
import { setCookie } from '~/.server/auth/cookie'
import { generateCodeVerifier, generateState } from '~/.server/oauth'
import { getSearchParam } from '~/lib/.server/url'
import { auth } from './+/github'

export async function loader({ request }) {
  let state = generateState()
  let codeVerifier = generateCodeVerifier()
  let scopes = ['user:email']
  let url = await auth.createAuthorizationURL(state, codeVerifier, scopes)
  let redirect_to = getSearchParam(request, 'redirect_to')
  let headers = await setCookie(request, {
    oauth_state: state,
    oauth_verifier: codeVerifier,
    redirect_to,
  })

  return redirect(url.toString(), { headers })
}
