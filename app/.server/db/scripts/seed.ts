import { User } from '~/models/.server/user'
import { log } from '~/utils/log'

const users = [
  ['Alice', 'alice@example.com'],
  ['Bob', 'bob@example.com'],
] as const

async function seed() {
  for (let [name, email] of users) {
    await User.create({
      name,
      email,
      password: 'password',
      verified_at: new Date(),
    })
  }
}

if (process.env.RESET_DB === '1') {
  await seed()
  log.success('Seeded verified users: Alice and Bob')
}
