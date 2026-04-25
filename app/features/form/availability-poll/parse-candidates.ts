import { availabilityPollDayjs } from './dayjs'
import type { AvailabilityPollSlot } from './types'
import { availabilityPollZoneToken } from './zone-token'

export const AVAILABILITY_POLL_MAX_CANDIDATE_LINES = 100

const ISO_DATE_HEAD = /^(\d{4}-\d{2}-\d{2})(\s*\([^)]*\))?/
const TIME_RANGE = /(\d{1,2}):(\d{2})\s*[-–—~〜]\s*(\d{1,2}):(\d{2})/
const ALL_DAY_AFTER_DATE = /^all day\.?$/i

function isAllDayAfterDate(afterDate: string): boolean {
  return ALL_DAY_AFTER_DATE.test(afterDate.trim())
}

function shortHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36).slice(0, 10)
}

function stableSlotId(
  timeZone: string,
  occurrence: number,
  normalizedLine: string,
): string {
  return `${availabilityPollZoneToken(timeZone)}@${shortHash(normalizedLine)}@${occurrence}`
}

function parseHmPart(raw: string, max: number): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null
  let n = parseInt(raw, 10)
  if (!Number.isInteger(n) || n < 0 || n > max) return null
  return n
}

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  let y = parseInt(m[1], 10)
  let mo = parseInt(m[2], 10)
  let d = parseInt(m[3], 10)
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return { y, m: mo, d }
}

export function isValidYmdInTimeZone(ymd: string, timeZone: string): boolean {
  let z = String(timeZone || '').trim()
  if (!z) return false
  if (!parseYmd(ymd)) return false
  let d = availabilityPollDayjs.tz(`${ymd}T12:00:00`, z)
  if (!d.isValid()) return false
  return d.format('YYYY-MM-DD') === ymd
}

/** One non-empty candidate line for list UI (remove, flash); ids align with parseCandidateLinesToSlots. */
export type CandidateLineRow = {
  physicalLineIndex: number
  trimmedLine: string
  occurrence: number
  /** Leading date looks like YYYY-MM-DD but is not valid in the organizer zone. */
  invalidDate: boolean
  /** Valid leading ISO date segment; with `rest`, the time/note tail is editable in the UI. */
  datePrefix?: string
  rest?: string
}

/**
 * Non-empty lines in document order, with occurrence index per duplicate trimmed line
 * (aligned with parseCandidateLinesToSlots / stable slot ids).
 */
export function parseCandidateLinesToRows(
  candidateLines: string,
  timeZone: string,
): CandidateLineRow[] {
  let z = String(timeZone || '').trim()
  let rawLines = String(candidateLines || '').split(/\r?\n/)
  let occurrenceByLine = new Map<string, number>()
  let rows: CandidateLineRow[] = []

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim()
    if (!line) continue

    let occurrence = occurrenceByLine.get(line) || 0
    occurrenceByLine.set(line, occurrence + 1)

    let m = ISO_DATE_HEAD.exec(line)
    if (!m) {
      rows.push({
        physicalLineIndex: i,
        trimmedLine: line,
        occurrence,
        invalidDate: false,
      })
      continue
    }

    let ymd = m[1]
    if (!isValidYmdInTimeZone(ymd, z)) {
      rows.push({
        physicalLineIndex: i,
        trimmedLine: line,
        occurrence,
        invalidDate: true,
      })
      continue
    }

    let datePrefix = m[0]
    let rest = line.slice(datePrefix.length).trim()
    rows.push({
      physicalLineIndex: i,
      trimmedLine: line,
      occurrence,
      invalidDate: false,
      datePrefix,
      rest,
    })
  }

  return rows
}

export function replaceRowAtPhysicalLineIndex(
  candidateLines: string,
  physicalLineIndex: number,
  newLine: string,
): string {
  let rawLines = String(candidateLines || '').split(/\r?\n/)
  if (physicalLineIndex < 0 || physicalLineIndex >= rawLines.length) {
    return candidateLines
  }
  rawLines[physicalLineIndex] = newLine
  return rawLines.join('\n')
}

export function removePhysicalLine(
  candidateLines: string,
  physicalLineIndex: number,
): string {
  let rawLines = String(candidateLines || '').split(/\r?\n/)
  if (physicalLineIndex < 0 || physicalLineIndex >= rawLines.length) {
    return candidateLines
  }
  rawLines.splice(physicalLineIndex, 1)
  return rawLines.join('\n')
}

function instantForYmdHm(
  ymd: string,
  h: number,
  m: number,
  timeZone: string,
): number | null {
  let d = availabilityPollDayjs.tz(
    `${ymd}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
    timeZone,
  )
  if (!d.isValid()) return null
  let parsed = parseYmd(ymd)
  if (!parsed) return null
  if (
    d.year() !== parsed.y ||
    d.month() + 1 !== parsed.m ||
    d.date() !== parsed.d ||
    d.hour() !== h ||
    d.minute() !== m
  ) {
    return null
  }
  return d.valueOf()
}

/**
 * Each non-empty line → one slot. Leading YYYY-MM-DD + optional time range
 * (24h H:mm) in organizer zone; otherwise unparsed freeform column.
 */
export function parseCandidateLinesToSlots(
  candidateLines: string,
  timeZone: string,
): AvailabilityPollSlot[] {
  let z = String(timeZone || '').trim()
  if (!z) return []

  let rawLines = String(candidateLines || '').split(/\r?\n/)
  let slots: AvailabilityPollSlot[] = []
  let unparsedOrder = 0
  let occurrenceByLine = new Map<string, number>()

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim()
    if (!line) continue

    let occurrence = occurrenceByLine.get(line) || 0
    occurrenceByLine.set(line, occurrence + 1)
    let id = stableSlotId(z, occurrence, line)
    let m = ISO_DATE_HEAD.exec(line)
    if (!m) {
      let base = 1e12 + unparsedOrder++
      slots.push({
        id,
        label: line,
        instantMs: base,
        unparsed: true,
      })
      continue
    }

    let ymd = m[1]
    let afterDate = line.slice(m[0].length).trim()
    let tr = TIME_RANGE.exec(afterDate)
    let startMs: number | null
    let endInstantMs: number | undefined
    let timeDisplayOverride: string | undefined
    if (tr) {
      let h1 = parseHmPart(tr[1], 23)
      let mi1 = parseHmPart(tr[2], 59)
      let h2 = parseHmPart(tr[3], 23)
      let mi2 = parseHmPart(tr[4], 59)
      if (h1 === null || mi1 === null || h2 === null || mi2 === null) {
        startMs = null
      } else {
        startMs = instantForYmdHm(ymd, h1, mi1, z)
        let endMs = instantForYmdHm(ymd, h2, mi2, z)
        if (startMs !== null && endMs !== null && endMs > startMs) {
          endInstantMs = endMs
        }
      }
    } else if (isAllDayAfterDate(afterDate)) {
      startMs = instantForYmdHm(ymd, 0, 0, z)
      timeDisplayOverride = 'All day'
    } else if (!afterDate.trim()) {
      startMs = instantForYmdHm(ymd, 12, 0, z)
      timeDisplayOverride = '—'
    } else {
      startMs = instantForYmdHm(ymd, 12, 0, z)
      timeDisplayOverride = afterDate
    }

    if (startMs === null) {
      let base = 1e12 + unparsedOrder++
      slots.push({
        id,
        label: line,
        instantMs: base,
        unparsed: true,
      })
      continue
    }

    slots.push({
      id,
      label: line,
      instantMs: startMs,
      ...(endInstantMs !== undefined ? { endInstantMs } : {}),
      ...(timeDisplayOverride !== undefined ? { timeDisplayOverride } : {}),
    })
  }

  return slots
}

export function countNonEmptyCandidateLines(candidateLines: string): number {
  let n = 0
  for (let row of String(candidateLines || '').split(/\r?\n/)) {
    if (row.trim()) n++
  }
  return n
}

/** Start instant for sorting; null → treat as “no time” (sorted after dated lines). */
function lineStartMsForSort(line: string, timeZone: string): number | null {
  let z = String(timeZone || '').trim()
  if (!z) return null
  let t = line.trim()
  if (!t) return null

  let m = ISO_DATE_HEAD.exec(t)
  if (!m) return null

  let ymd = m[1]
  let afterDate = t.slice(m[0].length).trim()
  let tr = TIME_RANGE.exec(afterDate)
  let startMs: number | null
  if (tr) {
    let h1 = parseHmPart(tr[1], 23)
    let mi1 = parseHmPart(tr[2], 59)
    startMs =
      h1 === null || mi1 === null ? null : instantForYmdHm(ymd, h1, mi1, z)
  } else if (isAllDayAfterDate(afterDate)) {
    startMs = instantForYmdHm(ymd, 0, 0, z)
  } else {
    startMs = instantForYmdHm(ymd, 12, 0, z)
  }
  return startMs
}

/** Non-empty lines only, ascending by parsed start; lines without a parseable date keep input order after dated lines. */
export function sortCandidateLinesByStartTime(
  candidateLines: string,
  timeZone: string,
): string {
  let z = String(timeZone || '').trim()
  if (!z) return candidateLines

  let rawLines = String(candidateLines || '').split(/\r?\n/)
  let nonEmpty = rawLines
    .map((text, orig) => ({ text, orig }))
    .filter((x) => x.text.trim())

  nonEmpty.sort((a, b) => {
    let ma = lineStartMsForSort(a.text, z)
    let mb = lineStartMsForSort(b.text, z)
    if (ma !== null && mb !== null) {
      if (ma !== mb) return ma - mb
      return a.orig - b.orig
    }
    if (ma !== null) return -1
    if (mb !== null) return 1
    return a.orig - b.orig
  })

  return nonEmpty.map((x) => x.text).join('\n')
}
