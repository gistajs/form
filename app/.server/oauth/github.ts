import { z } from 'zod'
import {
  authorizationURL,
  codeChallenge,
  exchangeToken,
  OAuthError,
  requestJSON,
  type OAuthConfig,
} from './core'

const tokenSchema = z.object({ access_token: z.string().min(1) })
const profileSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1),
  name: z.string().nullable(),
  avatar_url: z.string().optional(),
})
const emailsSchema = z.array(
  z.object({
    email: z.email(),
    primary: z.boolean(),
    verified: z.boolean(),
  }),
)

export type GitHubIdentity = {
  id: number
  email: string
  emailVerified: true
  name: string
  imageUrl?: string
  login: string
}

export function createGitHub(config: OAuthConfig) {
  async function validateAuthorizationCode(code: string, verifier: string) {
    return exchangeToken(
      config,
      'https://github.com/login/oauth/access_token',
      {
        grant_type: 'authorization_code',
        code,
        code_verifier: verifier,
        redirect_uri: config.redirectUri,
      },
      tokenSchema,
    )
  }
  return {
    async createAuthorizationURL(
      state: string,
      verifier: string,
      scopes: string[],
    ) {
      let url = authorizationURL(
        'https://github.com/login/oauth/authorize',
        config,
        state,
        scopes,
      )
      url.searchParams.set('code_challenge_method', 'S256')
      url.searchParams.set('code_challenge', await codeChallenge(verifier))
      return url
    },
    validateAuthorizationCode,
    async getIdentity(code: string, verifier: string): Promise<GitHubIdentity> {
      let tokens = await validateAuthorizationCode(code, verifier)
      let headers = {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.github+json',
      }
      let profile = await requestJSON(
        config,
        'https://api.github.com/user',
        { headers },
        profileSchema,
      )
      let emails = await requestJSON(
        config,
        'https://api.github.com/user/emails',
        { headers },
        emailsSchema,
      )
      let email = emails.find((entry) => entry.primary && entry.verified)?.email
      if (!email)
        throw new OAuthError('GitHub requires a verified primary email')
      return {
        id: profile.id,
        login: profile.login,
        email,
        emailVerified: true,
        name: profile.name || profile.login,
        imageUrl: profile.avatar_url,
      }
    },
  }
}
