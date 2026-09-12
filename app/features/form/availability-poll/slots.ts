import { availabilityPollDayjs } from './dayjs'
import { parseCandidateLinesToSlots } from './parse-candidates'
import { normalizeAvailabilityPollConfig } from './time'
import type { AvailabilityPollSlot, AvailabilityPoll } from './types'

export type { AvailabilityPollSlot, AvailabilityPoll } from './types'
export { availabilityPollZoneToken } from './zone-token'

export function buildAvailabilityPollSlots(
  raw: AvailabilityPoll | null | undefined,
): AvailabilityPollSlot[] {
  let cfg = normalizeAvailabilityPollConfig(raw)
  if (!cfg || !cfg.time_zone) return []
  return parseCandidateLinesToSlots(cfg.candidate_lines, cfg.time_zone)
}

export function slotIdSet(slots: AvailabilityPollSlot[]): Set<string> {
  return new Set(slots.map((s) => s.id))
}

const OTHER_DAY_KEY = '__other__'

export type AvailabilityPollSlotDay = {
  date: string
  dateLabel: string
  slots: {
    slot: AvailabilityPollSlot
    /** Start (or only) time; with `timeEndLabel`, stack vertically in headers. */
    timeLabel: string
    timeEndLabel?: string
  }[]
}

/** Group flat slots by calendar day with short date/time labels. */
export function groupSlotsByDay(
  slots: AvailabilityPollSlot[],
  timeZone: string,
): AvailabilityPollSlotDay[] {
  let dateFmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    timeZone,
  })
  let timeFmt = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    timeZone,
  })

  let map = new Map<string, AvailabilityPollSlotDay>()
  for (let slot of slots) {
    let ymd: string
    let dateLabel: string
    if (slot.unparsed) {
      ymd = OTHER_DAY_KEY
      dateLabel = 'Other'
    } else {
      ymd = availabilityPollDayjs(slot.instantMs)
        .tz(timeZone)
        .format('YYYY-MM-DD')
      dateLabel = dateFmt.format(new Date(slot.instantMs))
    }

    let day = map.get(ymd)
    if (!day) {
      day = {
        date: ymd,
        dateLabel,
        slots: [],
      }
      map.set(ymd, day)
    }
    let timeLabel: string
    let timeEndLabel: string | undefined
    if (slot.unparsed) {
      timeLabel = '—'
    } else if (slot.timeDisplayOverride) {
      timeLabel = slot.timeDisplayOverride
    } else if (
      slot.endInstantMs != null &&
      slot.endInstantMs > slot.instantMs
    ) {
      timeLabel = timeFmt.format(new Date(slot.instantMs))
      timeEndLabel = timeFmt.format(new Date(slot.endInstantMs))
    } else {
      timeLabel = timeFmt.format(new Date(slot.instantMs))
    }

    day.slots.push({
      slot,
      timeLabel,
      ...(timeEndLabel !== undefined ? { timeEndLabel } : {}),
    })
  }
  return Array.from(map.values())
}
