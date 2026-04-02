import { execFileSync, execSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { cp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
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

if (process.stdin.isTTY) {
  let rl = createInterface({ input: process.stdin, output: process.stdout })

  try {
    let dbUrl = file.match(/^DB_URL=(.*)$/m)?.[1]?.trim() ?? ''
    let hasTurso = false

    try {
      execFileSync('which', ['turso'], { stdio: 'ignore' })
      hasTurso = true
    } catch {}

    if (!dbUrl && hasTurso) {
      let answer = await rl.question('Create a Turso database? (y/N) ')

      if (answer.trim().toLowerCase() === 'y') {
        let fallback = path.basename(root)
        let dbName = await rl.question(`Database name (${fallback}): `)
        let name = dbName.trim() || fallback

        execFileSync('turso', ['db', 'create', name], {
          stdio: 'inherit',
          cwd: root,
        })

        let url = execFileSync('turso', ['db', 'show', name, '--url'], {
          cwd: root,
          encoding: 'utf8',
        }).trim()
        let token = execFileSync('turso', ['db', 'tokens', 'create', name], {
          cwd: root,
          encoding: 'utf8',
        }).trim()

        file = setEnvVar(file, 'DB_URL', url)
        file = setEnvVar(file, 'DB_AUTH_TOKEN', token)
        await writeFile(envPath, file)
      }
    }

    let smtpConfig = file.match(/^SMTP_CONFIG=(.*)$/m)?.[1]?.trim() ?? ''

    if (!smtpConfig) {
      let value = await rl.question('SMTP_CONFIG (JSON, Enter to skip): ')

      if (value.trim()) {
        smtpConfig = value.trim()
        file = setEnvVar(file, 'SMTP_CONFIG', smtpConfig)
        await writeFile(envPath, file)
      }
    }
  } finally {
    rl.close()
  }
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
  'Setup complete. Applied Atlas, seeded Alice/Bob, and auth links will be emailed when SMTP is configured or logged to the console otherwise.',
)

function setEnvVar(file, key, value) {
  if (file.match(new RegExp(`^${key}=.*$`, 'm'))) {
    return file.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
  }

  return `${file.trimEnd()}\n${key}=${value}\n`
}
