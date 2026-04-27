import { Google } from 'arctic'

export const auth = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.ORIGIN!}/oauth/google/callback`,
)
