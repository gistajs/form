import { z } from 'zod'

export type OAuthConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  fetch?: typeof fetch
}

export class OAuthError extends Error {}

export function generateState() {
  return randomString()
}

export function generateCodeVerifier() {
  return randomString()
}

function randomString() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)))
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

export async function codeChallenge(verifier: string) {
  return base64url(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
    ),
  )
}

export function authorizationURL(
  endpoint: string,
  config: OAuthConfig,
  state: string,
  scopes: string[],
) {
  let url = new URL(endpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: scopes.join(' '),
  }).toString()
  return url
}

export async function requestJSON<T>(
  config: OAuthConfig,
  url: string,
  init: RequestInit,
  schema: z.ZodType<T>,
): Promise<T> {
  try {
    let response = await (config.fetch ?? fetch)(url, init)
    if (!response.ok) throw new OAuthError('OAuth request failed')
    let result = schema.safeParse(await response.json())
    if (!result.success) throw new OAuthError('Invalid OAuth response')
    return result.data
  } catch (error) {
    if (error instanceof OAuthError) throw error
    // Do not expose token responses, authorization codes, or credentials in errors.
    throw new OAuthError('OAuth request failed')
  }
}

export function exchangeToken<T>(
  config: OAuthConfig,
  endpoint: string,
  input: Record<string, string>,
  schema: z.ZodType<T>,
) {
  return requestJSON(
    config,
    endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        ...input,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    },
    schema,
  )
}
