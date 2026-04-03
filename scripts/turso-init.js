import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '..')
const envExamplePath = path.join(root, '.env.example')
const envPath = path.join(root, '.env')

if (!existsSync(envPath)) {
  await cp(envExamplePath, envPath)
  console.log('Created .env from .env.example')
}

try {
  execFileSync('which', ['turso'], { stdio: 'ignore' })
} catch {
  console.error('Turso CLI not found. Install `turso` first and run again.')
  process.exit(1)
}

let file = await readFile(envPath, 'utf8')
let currentUrl = file.match(/^DB_URL=(.*)$/m)?.[1]?.trim() ?? ''
let currentToken = file.match(/^DB_AUTH_TOKEN=(.*)$/m)?.[1]?.trim() ?? ''

if (currentUrl) {
  console.log('DB_URL is already set in .env')
}

if (currentToken) {
  console.log('DB_AUTH_TOKEN is already set in .env')
}

let rl = createInterface({ input: process.stdin, output: process.stdout })

try {
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

  console.log('Saved Turso credentials to .env')
} finally {
  rl.close()
}

function setEnvVar(file, key, value) {
  if (file.match(new RegExp(`^${key}=.*$`, 'm'))) {
    return file.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
  }

  return `${file.trimEnd()}\n${key}=${value}\n`
}
