import path from 'path'

const dbName = 'dev.db'
const dbPath = path.join(process.cwd(), 'data', dbName)

const isProd = process.env.NODE_ENV === 'production'

export const dbCredentials = isProd
  ? { url: process.env.DB_URL!, authToken: process.env.DB_AUTH_TOKEN! }
  : { url: `file:${dbPath}` }
