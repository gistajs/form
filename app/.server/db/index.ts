import { drizzle } from 'drizzle-orm/libsql'
import { dbCredentials } from '~/config/.server/db'
import * as schema from './schema'

export const db = drizzle({
  connection: dbCredentials,
  schema,
})
