import type { SubmissionSelect } from '~/features/form/types'
import type { AvailabilityPollSlot } from './slots'

export type AvailabilityPollSlotVoteTotals = {
  yes: number
  maybe: number
  no: number
}

/** Per-slot yes / maybe / no counts; only keys present in `slots` are counted. */
export function aggregateAvailabilityPollVotes(
  slots: AvailabilityPollSlot[],
  submissions: SubmissionSelect[],
): Record<string, AvailabilityPollSlotVoteTotals> {
  let totals: Record<string, AvailabilityPollSlotVoteTotals> = {}
  for (let s of slots) {
    totals[s.id] = { yes: 0, maybe: 0, no: 0 }
  }
  let slotIds = new Set(slots.map((s) => s.id))
  for (let sub of submissions) {
    let data = (sub.data || {}) as Record<string, string>
    let raw: Record<string, string> = {}
    try {
      raw = JSON.parse(data.availability || '{}') as Record<string, string>
    } catch {
      raw = {}
    }
    for (let id of slotIds) {
      let v = String(raw[id] || '').toLowerCase()
      if (v === 'yes') totals[id].yes++
      else if (v === 'maybe') totals[id].maybe++
      else if (v === 'no') totals[id].no++
    }
  }
  return totals
}

export type ParsedAvailabilityPollRow = {
  subId: number
  name: string
  comment: string
  votes: Record<string, string>
}

export function parseSubmissionRow(
  sub: SubmissionSelect,
  slots: AvailabilityPollSlot[],
): ParsedAvailabilityPollRow {
  let data = (sub.data || {}) as Record<string, string>
  let name = (data.name || '').trim() || 'Anonymous'
  let comment = (data.comment || '').trim()
  let votes: Record<string, string> = {}
  let raw: Record<string, string> = {}
  try {
    raw = JSON.parse(data.availability || '{}') as Record<string, string>
  } catch {
    raw = {}
  }
  let slotIds = new Set(slots.map((s) => s.id))
  for (let key of Object.keys(raw)) {
    if (slotIds.has(key)) votes[key] = raw[key]
  }
  return { subId: sub.id, name, comment, votes }
}

export function formatSlotCounts(
  rows: ParsedAvailabilityPollRow[],
  slotId: string,
): { short: string; longTitle: string } {
  let yes = 0
  let maybe = 0
  let no = 0
  for (let row of rows) {
    let v = (row.votes[slotId] || '').toLowerCase()
    if (v === 'yes') yes++
    else if (v === 'maybe') maybe++
    else if (v === 'no') no++
  }
  let longParts: string[] = []
  if (yes) longParts.push(`${yes} yes`)
  if (maybe) longParts.push(`${maybe} maybe`)
  if (no) longParts.push(`${no} no`)
  let longTitle = longParts.length ? longParts.join(' · ') : 'No votes'
  let shortParts: string[] = []
  if (yes) shortParts.push(`${yes}Y`)
  if (maybe) shortParts.push(`${maybe}M`)
  if (no) shortParts.push(`${no}N`)
  let short = shortParts.length ? shortParts.join(' ') : '—'
  return { short, longTitle }
}
