import { User } from '~/models/.server/user'
import { log } from '~/utils/log'
import { seed } from './seed'

let count = await User.count()

if (count > 0) {
  log.success('Production database already has users. Skipped seed.')
  process.exit(0)
}

await seed()
log.success('Seeded initial production users: Alice and Bob')
