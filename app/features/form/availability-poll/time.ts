import { availabilityPollDayjs } from './dayjs'
import type { AvailabilityPoll } from './types'

const PROBE = '2020-06-01T12:00:00'

export function isUsableAvailabilityTimeZone(zone: string): boolean {
  if (!zone || typeof zone !== 'string' || !zone.trim()) return false
  let z = zone.trim()
  try {
    let d = availabilityPollDayjs.tz(PROBE, z)
    if (!d.isValid()) return false
    let again = availabilityPollDayjs.tz(d.format('YYYY-MM-DDTHH:mm:ss'), z)
    return again.isValid()
  } catch {
    return false
  }
}

export function normalizeAvailabilityPollConfig(
  raw: unknown,
): AvailabilityPoll | null {
  if (!raw || typeof raw !== 'object') return null
  let o = raw as Record<string, unknown>
  let time_zone = String(o.time_zone || '').trim()
  if (!time_zone) return null
  // Missing or non-boolean → false: stored configs from before this field, and
  // invalid values we refuse to interpret as true (same as "not read-only").
  let readonly_responses =
    typeof o.readonly_responses === 'boolean' ? o.readonly_responses : false
  return {
    time_zone,
    candidate_lines: String(o.candidate_lines ?? ''),
    readonly_responses,
  }
}
