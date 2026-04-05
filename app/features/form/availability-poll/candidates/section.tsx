import { CalendarDaysIcon } from 'lucide-react'
import type { ReactNode, Ref, RefObject } from 'react'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  type CandidateLineRow,
  AVAILABILITY_POLL_MAX_CANDIDATE_LINES,
  parseCandidateLinesToRows,
  parseCandidateLinesToSlots,
  removePhysicalLine,
  replaceRowAtPhysicalLineIndex,
  sortCandidateLinesByStartTime,
} from '../parse-candidates'
import { endHmChoicesAfter } from './quarter-hours'
import { QuickAdd } from './quick-add'
import { PersistedRowBlock } from './row'

export type AvailabilityCandidatesHandle = {
  /** Sort lines from ref; safe to POST. */
  flushToCanonical: () => string
}

type AvailabilityCandidatesSectionProps = {
  ref?: Ref<AvailabilityCandidatesHandle | null>
  timeZone: string
  variant: 'draft' | 'saved'
  candidateLines: string
  onCandidateLinesChange: (next: string) => void
  trailing?: ReactNode
}

export function AvailabilityCandidatesSection({
  ref,
  timeZone,
  variant,
  candidateLines,
  onCandidateLinesChange,
  trailing,
}: AvailabilityCandidatesSectionProps) {
  let { linesRef, syncLines } = useSyncedCandidateLines(
    candidateLines,
    onCandidateLinesChange,
  )
  let { flash, setFlash } = useFlashDismiss()
  let {
    appendTime,
    setAppendTime,
    startHm,
    setStartHm,
    endHm,
    setEndHm,
    endOptions,
    timeRangeLabel,
  } = useQuickAddTimeRange()

  let slots = parseCandidateLinesToSlots(candidateLines, timeZone)
  let slotCount = slots.length
  let unparsedCount = slots.filter((s) => s.unparsed).length
  let persistedRows = parseCandidateLinesToRows(candidateLines, timeZone)
  let atLineCap = slotCount >= AVAILABILITY_POLL_MAX_CANDIDATE_LINES

  let optionsScrollRef = useRef<HTMLDivElement>(null)
  let optionsOverflowing = useOverflowing(optionsScrollRef, [candidateLines])

  useEffect(() => {
    if (!flash) return
    let target = persistedRows.find(
      (r) =>
        r.trimmedLine === flash.trimmedLine &&
        r.occurrence === flash.occurrence,
    )
    if (!target) return
    let el = optionsScrollRef.current?.querySelector(
      `[data-option-row="${target.physicalLineIndex}"]`,
    )
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'nearest', behavior: 'auto' })
    }
  }, [flash])

  let intro =
    variant === 'draft'
      ? `Times use your saved organizer time zone (${timeZone}). Edits apply to this draft until you save the scaffold.`
      : `Times use your saved organizer time zone (${timeZone}). Changing your laptop time zone does not shift stored times.`

  useFlushToCanonicalHandle(ref, linesRef, timeZone)

  /** Calendar quick-add: existing line → flash only; otherwise append (respects line cap). */
  function onCalendarSelectLine(line: string) {
    let t = line.trim()
    if (!t) return
    let cur = linesRef.current
    let occurrence = countOccurrencesOfLine(cur, t)
    if (occurrence > 0) {
      setFlash({ trimmedLine: t, occurrence: 0 })
      return
    }
    if (atLineCap) return
    let next = cur.trim() ? `${cur}\n${line}` : line
    let sorted = sortCandidateLinesByStartTime(next, timeZone)
    syncLines(sorted)
    setFlash({ trimmedLine: t, occurrence })
  }

  function removePersistedRow(row: CandidateLineRow) {
    let next = removePhysicalLine(linesRef.current, row.physicalLineIndex)
    syncLines(sortCandidateLinesByStartTime(next, timeZone))
  }

  function applyDatedChange(row: CandidateLineRow, rest: string) {
    if (!row.datePrefix) return
    let newLine = row.datePrefix + (rest.trim() ? ` ${rest.trim()}` : '')
    syncLines(
      replaceRowAtPhysicalLineIndex(
        linesRef.current,
        row.physicalLineIndex,
        newLine,
      ),
    )
  }

  function blurSortPersisted() {
    syncLines(sortCandidateLinesByStartTime(linesRef.current, timeZone))
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className="h-5 w-5 shrink-0 text-primary/80" />
        <h2 className="text-lg font-semibold tracking-tight">
          Availability slots
        </h2>
      </div>

      <div className="divider my-1 opacity-50" />

      <p className="mb-6 text-sm leading-relaxed text-base-content/60">
        {intro}
      </p>

      <div className="flex flex-col md:flex-row md:items-start">
        <div className="w-full shrink-0 md:w-fit md:max-w-full">
          <QuickAdd
            timeZone={timeZone}
            appendTime={appendTime}
            setAppendTime={setAppendTime}
            startHm={startHm}
            endHm={endHm}
            setEndHm={setEndHm}
            onStartHmChange={setStartHm}
            endOptions={endOptions}
            timeRangeLabel={timeRangeLabel}
            onCalendarSelectLine={onCalendarSelectLine}
            atLineCap={atLineCap}
          />
        </div>

        <div className="divider my-1 opacity-25 md:divider-horizontal" />

        <div className="min-w-0 flex-1">
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-tight text-base-content/80">
              Options
            </h3>
            {persistedRows.length > 0 ? (
              <p className="mb-2 text-xs text-base-content/50">
                Select dates with Quick add. Adjust a specific option below only
                when needed.
              </p>
            ) : null}
            <div
              ref={optionsScrollRef}
              className="max-h-[min(24rem,60vh)] space-y-0.5 overflow-y-auto rounded-lg border border-base-300/50 p-1"
            >
              {persistedRows.map((row) => (
                <div
                  key={row.physicalLineIndex}
                  data-option-row={row.physicalLineIndex}
                >
                  <PersistedRowBlock
                    row={row}
                    flash={flash}
                    onRemove={() => removePersistedRow(row)}
                    onChangeDated={(rest) => applyDatedChange(row, rest)}
                    onBlurSort={blurSortPersisted}
                  />
                </div>
              ))}
              {persistedRows.length === 0 ? (
                <p className="text-xs text-base-content/50">
                  No options yet. Select dates in Quick add.
                </p>
              ) : null}
            </div>
            <div className="mt-2 space-y-1 px-1 text-right text-xs text-base-content/50">
              {optionsOverflowing ? (
                <p>
                  {slotCount} vote slot{slotCount === 1 ? '' : 's'}
                </p>
              ) : null}
              {unparsedCount > 0 ? (
                <p>
                  {unparsedCount} line{unparsedCount === 1 ? '' : 's'} without a
                  leading date (shown under &quot;Other&quot;).
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="divider my-1 opacity-50" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {trailing}
      </div>
    </div>
  )
}

function useSyncedCandidateLines(
  candidateLines: string,
  onCandidateLinesChange: (next: string) => void,
) {
  let linesRef = useRef(candidateLines)
  useEffect(() => {
    linesRef.current = candidateLines
  }, [candidateLines])

  function syncLines(next: string) {
    linesRef.current = next
    onCandidateLinesChange(next)
  }

  return { linesRef, syncLines }
}

type Flash = { trimmedLine: string; occurrence: number }

function useFlashDismiss() {
  let [flash, setFlash] = useState<Flash | null>(null)
  useEffect(() => {
    if (!flash) return
    let t = window.setTimeout(() => setFlash(null), 280)
    return () => window.clearTimeout(t)
  }, [flash])
  return { flash, setFlash }
}

function useOverflowing(
  ref: RefObject<HTMLElement | null>,
  deps: (number | string)[],
) {
  let [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    function measure() {
      let el = ref.current
      if (!el) return
      setOverflowing(el.scrollHeight > el.clientHeight + 1)
    }

    let el = ref.current
    if (!el) return

    measure()

    let observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(el)
    window.addEventListener('resize', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref, ...deps])

  return overflowing
}

function useQuickAddTimeRange() {
  let [appendTime, setAppendTime] = useState(true)
  let [startHm, setStartHm] = useState('18:00')
  let [endHm, setEndHm] = useState('20:00')

  let endOptions = endHmChoicesAfter(startHm)
  let timeRangeLabel = `${startHm}\u2013${endHm}`

  useEffect(() => {
    setEndHm((prev) => {
      let opts = endHmChoicesAfter(startHm)
      if (!opts.length) return prev
      return opts.includes(prev) ? prev : opts[0]
    })
  }, [startHm])

  return {
    appendTime,
    setAppendTime,
    startHm,
    setStartHm,
    endHm,
    setEndHm,
    endOptions,
    timeRangeLabel,
  }
}

function useFlushToCanonicalHandle(
  ref: Ref<AvailabilityCandidatesHandle | null> | undefined,
  linesRef: RefObject<string>,
  timeZone: string,
) {
  useImperativeHandle(ref, () => ({
    flushToCanonical: () => {
      let sorted = sortCandidateLinesByStartTime(linesRef.current, timeZone)
      linesRef.current = sorted
      return sorted
    },
  }))
}

function countOccurrencesOfLine(lines: string, trimmed: string): number {
  let n = 0
  for (let row of lines.split(/\r?\n/)) {
    if (row.trim() === trimmed) n++
  }
  return n
}
