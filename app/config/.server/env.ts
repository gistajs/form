import { assert } from 'es-toolkit'

const PublicKeys = ['NODE_ENV'] as const

export const PublicEnv = Object.fromEntries(
  PublicKeys.map((key) => [key, process.env[key]]),
)

export function requireEnv(key: string) {
  let value = process.env[key]
  assert(value, `Missing ${key} env var`)
  return value
}
