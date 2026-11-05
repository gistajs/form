import { createGoogle } from '~/.server/oauth'

export const auth = createGoogle({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.ORIGIN!}/oauth/google/callback`,
})
