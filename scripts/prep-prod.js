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
const seedScript = 'app/.server/db/scripts/seed-prod.ts'
const prodEnv = { ...process.env, NODE_ENV: 'production' }

if (!existsSync(envPath)) {
  await cp(envExamplePath, envPath)
  console.log('Created .env from .env.example')
}

let file = await readFile(envPath, 'utf8')
let cookieSecret = file.match(/^COOKIE_SECRET=(.*)$/m)?.[1]?.trim() ?? ''

if (cookieSecret.length < 32) {
  cookieSecret = randomBytes(32).toString('hex')
  file = setEnvVar(file, 'COOKIE_SECRET', cookieSecret)
  await writeFile(envPath, file)
}

console.log('COOKIE_SECRET is set')

execSync('pnpm atlas:prod', {
  stdio: 'inherit',
  cwd: root,
  env: prodEnv,
})

execSync(`dotenv -- tsx ${seedScript}`, {
  stdio: 'inherit',
  cwd: root,
  env: prodEnv,
})

console.log('Production setup complete.')

function setEnvVar(file, key, value) {
  if (file.match(new RegExp(`^${key}=.*$`, 'm'))) {
    return file.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
  }

  return `${file.trimEnd()}\n${key}=${value}\n`
}
