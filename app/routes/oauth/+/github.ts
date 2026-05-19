import { GitHub } from 'arctic'

export const auth = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  `${process.env.ORIGIN!}/oauth/github/callback`,
)
