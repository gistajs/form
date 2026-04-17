import { execSync } from 'node:child_process'

execSync('tsx app/.server/db/scripts/reset.ts', {
  stdio: 'inherit',
  cwd: new URL('..', import.meta.url),
})
