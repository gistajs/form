import { z } from 'zod'
import {
  authorizationURL,
  codeChallenge,
  exchangeToken,
  OAuthError,
  type OAuthConfig,
} from './core'

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1).optional(),
  id_token: z.string().min(1).optional(),
})

export function createGoogle(config: OAuthConfig) {
  async function validateAuthorizationCode(code: string, verifier: string) {
    return exchangeToken(
      config,
      'https://oauth2.googleapis.com/token',
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
        'https://accounts.google.com/o/oauth2/v2/auth',
        config,
        state,
        scopes,
      )
      url.searchParams.set('code_challenge_method', 'S256')
      url.searchParams.set('code_challenge', await codeChallenge(verifier))
      return url
    },
    validateAuthorizationCode,
    async getIdentity(code: string, verifier: string): Promise<GoogleIdentity> {
      let tokens = await validateAuthorizationCode(code, verifier)
      let claims = readTokenClaims(tokens.id_token, config.clientId)
      if (!claims.email_verified)
        throw new OAuthError('Google requires a verified email')
      return {
        id: claims.sub,
        email: claims.email,
        emailVerified: true,
        name: claims.name || claims.given_name || claims.email,
        imageUrl: claims.picture,
      }
    },
    refreshAccessToken(refreshToken: string) {
      return exchangeToken(
        config,
        'https://oauth2.googleapis.com/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        tokenSchema,
      )
    },
  }
}

export type GoogleIdentity = {
  id: string
  email: string
  emailVerified: true
  name: string
  imageUrl?: string
}

const claimsSchema = z.object({
  iss: z.enum(['https://accounts.google.com', 'accounts.google.com']),
  aud: z.union([z.string(), z.array(z.string()).min(1)]),
  azp: z.string().optional(),
  exp: z.number().int(),
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  picture: z.string().optional(),
})

// Only called with a token received directly from Google's fixed HTTPS token
// endpoint. This is not a verifier for ID tokens submitted by a browser/client.
function readTokenClaims(token: string | undefined, clientId: string) {
  try {
    let parts = token?.split('.')
    if (!parts || parts.length !== 3 || parts.some((part) => !part))
      throw new Error()
    let payload = parts[1].replaceAll('-', '+').replaceAll('_', '/')
    let bytes = Uint8Array.from(atob(payload), (character) =>
      character.charCodeAt(0),
    )
    let claims = claimsSchema.parse(
      JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)),
    )
    let audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    if (
      !audiences.includes(clientId) ||
      claims.exp <= Date.now() / 1000 ||
      (claims.azp !== undefined && claims.azp !== clientId) ||
      (audiences.length > 1 && claims.azp !== clientId)
    )
      throw new Error()
    return claims
  } catch {
    throw new OAuthError('Invalid Google ID token')
  }
}
