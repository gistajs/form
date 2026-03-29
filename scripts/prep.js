import { execSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { cp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '..')
const envExamplePath = path.join(root, '.env.example')
const envPath = path.join(root, '.env')
const SEED_SCRIPT = 'app/.server/db/scripts/seed.ts'
const env = { ...process.env, RESET_DB: '1' }

let createdEnv = false

if (!existsSync(envPath)) {
  await cp(envExamplePath, envPath)
  createdEnv = true
}

let file = await readFile(envPath, 'utf8')
let cookieSecret = file.match(/^COOKIE_SECRET=(.*)$/m)?.[1]?.trim() ?? ''

if (cookieSecret.length < 32) {
  cookieSecret = randomBytes(32).toString('hex')

  if (file.match(/^COOKIE_SECRET=.*$/m)) {
    file = file.replace(/^COOKIE_SECRET=.*$/m, `COOKIE_SECRET=${cookieSecret}`)
  } else {
    file = `${file.trimEnd()}\nCOOKIE_SECRET=${cookieSecret}\n`
  }

  await writeFile(envPath, file)
}

if (createdEnv) {
  console.log('Created .env from .env.example')
}

if (cookieSecret.length >= 32) {
  console.log('COOKIE_SECRET is set')
}

execSync('atlas schema apply --env dev --auto-approve', {
  stdio: 'inherit',
  cwd: root,
  env,
})

execSync(`tsx ${SEED_SCRIPT}`, {
  stdio: 'inherit',
  cwd: root,
  env,
})

console.log(
  'Setup complete. Applied Atlas, seeded Alice/Bob, and generated auth links in logs until SMTP is configured.',
)
