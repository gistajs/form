import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { dbPath } from '~/config/.server/db'
import { log } from '~/utils/log'

const SEED_SCRIPT = 'app/.server/db/scripts/seed.ts'
const env = { ...process.env, RESET_DB: '1' }

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath)
}

execSync('atlas schema apply --env dev --auto-approve', {
  stdio: 'inherit',
  env,
})

execSync(`tsx ${SEED_SCRIPT}`, { stdio: 'inherit', env })

log.success('Dev DB reset + seeded.')
