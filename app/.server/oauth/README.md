# OAuth clients

This directory is intended for GistaJS starters. Distribute changes through
starter releases and `gistajs diff` / pin updates, rather than the gistajs CLI's npm
package. It uses Zod and standard Web APIs; no application imports, environment
variables, database, cookies, or framework dependencies belong here.

Create Google/GitHub clients with `clientId`, `clientSecret`, `redirectUri`, and an
optional `fetch` implementation. Keep credentials on the server. Routes own scopes,
state/verifier cookies, redirects, and local account linking. Google login requires
`openid profile email`; GitHub login requires `user:email`. Both use S256 PKCE.
`getIdentity(code, verifier)` exchanges the code and returns a provider-specific
identity with a verified email. GitHub requires a verified **primary** email.

Google ID tokens are read only inside `getIdentity`, directly after a request to
Google's fixed HTTPS token endpoint. Issuer, audience, authorized party, expiration,
and identity claims are checked. Signature verification is intentionally omitted
for this authenticated backchannel response, as permitted by Google's OIDC guidance.
This is not an API for verifying browser-submitted tokens. An injected fetch must
preserve the same trust boundary. See https://developers.google.com/identity/openid-connect/openid-connect.

Google's code exchange / refresh methods can also serve integrations with separate
credentials; they do not require an ID token. Keep integration-specific response
adapters in the calling application. No refresh token is stored by the login flow.

Local account lookup remains email-based. The application rejects replacement of
an existing provider ID, but this module does not enforce provider-ID uniqueness,
perform account merges, or migrate existing identities. Those policies belong to
the application and its database.

The parent repository tests OAuth protocol and identity trust boundaries with injected
fetch responses. Tests require no credentials, external requests, or real user records
and are not included in exported starters.
