import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { cp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '..')
const envExamplePath = path.join(root, '.env.example')
const envPath = path.join(root, '.env')

let createdEnv = false

if (!existsSync(envPath)) {
  await cp(envExamplePath, envPath)
  createdEnv = true
}

let env = await readFile(envPath, 'utf8')
let cookieSecret = env.match(/^COOKIE_SECRET=(.*)$/m)?.[1]?.trim() ?? ''

if (cookieSecret.length < 32) {
  cookieSecret = randomBytes(32).toString('hex')

  if (env.match(/^COOKIE_SECRET=.*$/m)) {
    env = env.replace(/^COOKIE_SECRET=.*$/m, `COOKIE_SECRET=${cookieSecret}`)
  } else {
    env = `${env.trimEnd()}\nCOOKIE_SECRET=${cookieSecret}\n`
  }

  await writeFile(envPath, env)
}

if (createdEnv) {
  console.log('Created .env from .env.example')
}

if (cookieSecret.length >= 32) {
  console.log('COOKIE_SECRET is set')
}

console.log(
  'Setup complete. Run `atlas schema apply --env dev`, then `pnpm dev`.',
)
