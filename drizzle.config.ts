import { defineConfig } from 'drizzle-kit'
import { dbCredentials } from './app/config/.server/db'
import { isProd } from './app/config/env'

export default defineConfig({
  schema: './app/.server/db/schema.ts',
  dialect: isProd ? 'turso' : 'sqlite',
  dbCredentials,
})
