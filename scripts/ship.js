import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const out = (cmd) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}

if (out('git branch --show-current') !== 'dev')
  fail('Error: switch to the dev branch before running pnpm ship')
if (out('git status --porcelain'))
  fail('Error: commit or stash your changes before running pnpm ship')

run('git fetch origin')

const ahead = out('git rev-list --count origin/main..dev')
if (ahead === '0') fail('Error: there is nothing new to ship from dev to main')

run('git push --force-with-lease origin dev:main')
