import { createGitHub } from '~/.server/oauth'

export const auth = createGitHub({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: `${process.env.ORIGIN!}/oauth/github/callback`,
})
