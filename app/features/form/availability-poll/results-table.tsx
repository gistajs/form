import type { SubmissionSelect } from '~/features/form/types'
import { cn } from '~/lib/cn'
import type { AvailabilityPollSlot } from './slots'
import { groupSlotsByDay } from './slots'
import {
  formatSlotCounts,
  parseSubmissionRow,
  type ParsedAvailabilityPollRow,
} from './votes'

type AvailabilityPollResultsProps = {
  slots: AvailabilityPollSlot[]
  submissions: SubmissionSelect[]
  /** IANA zone; used to group column headers by calendar day. */
  timeZone: string
  showComments: boolean
  onEdit?: (row: ParsedAvailabilityPollRow) => void
  title?: string
}

const STICKY_NAME_TH =
  'sticky left-0 z-20 border-r border-base-300/50 bg-base-200/80 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]'
const STICKY_NAME_TD =
  'sticky left-0 z-10 border-r border-base-300/50 bg-base-100 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]'

export function AvailabilityPollResultsTable({
  slots,
  submissions,
  timeZone,
  showComments,
  onEdit,
  title = 'Results',
}: AvailabilityPollResultsProps) {
  if (slots.length === 0) return null

  let rows =
    submissions.length > 0
      ? submissions.map((sub) => parseSubmissionRow(sub, slots))
      : []
  let days = groupSlotsByDay(slots, timeZone)
  let emptyBodyColSpan = 1 + slots.length + (showComments ? 1 : 0)
  let tableDense =
    'table table-sm [&_th]:px-1.5 [&_td]:px-1.5 [&_th]:py-1 [&_td]:py-1'

  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold tracking-tight text-base-content/80 sm:text-sm">
        {title}
      </h4>
      <div className="overflow-x-auto rounded-xl border border-base-300/80">
        <table className={tableDense}>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className={cn('text-xs font-medium', STICKY_NAME_TH)}
              >
                Name
              </th>
              {days.map((day) => (
                <th
                  key={day.date}
                  colSpan={day.slots.length}
                  className="bg-base-200/80 text-center text-[10px] leading-tight font-medium whitespace-normal"
                >
                  {day.dateLabel}
                </th>
              ))}
              {showComments ? (
                <th
                  rowSpan={2}
                  className="max-w-32 min-w-20 bg-base-200/80 text-xs font-medium"
                >
                  Comment
                </th>
              ) : null}
            </tr>
            <tr>
              {days.map((day) =>
                day.slots.map(({ slot, timeLabel, timeEndLabel }) => (
                  <th
                    key={slot.id}
                    title={slot.label}
                    className="min-w-11 bg-base-200/70 px-0.5 py-1 text-center text-[10px] leading-tight font-medium"
                  >
                    <span className="flex flex-col items-center gap-0.5">
                      <span>{timeLabel}</span>
                      {timeEndLabel ? (
                        <span className="text-[9px] font-normal text-base-content/70">
                          {timeEndLabel}
                        </span>
                      ) : null}
                    </span>
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={emptyBodyColSpan}
                  className="bg-base-100/40 py-6 text-center text-xs text-base-content/50"
                >
                  No responses yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.subId}>
                  <td
                    className={cn(
                      'max-w-40 truncate text-xs font-medium',
                      STICKY_NAME_TD,
                    )}
                  >
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="max-w-full link truncate text-left link-primary"
                        title={row.name}
                      >
                        {row.name}
                      </button>
                    ) : (
                      <span title={row.name}>{row.name}</span>
                    )}
                  </td>
                  {slots.map((s) => (
                    <td key={s.id} className="text-center align-middle">
                      <VoteBadge value={row.votes[s.id]} />
                    </td>
                  ))}
                  {showComments ? (
                    <td
                      className="max-w-32 truncate text-[10px] text-base-content/70"
                      title={row.comment || undefined}
                    >
                      {row.comment || '—'}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 ? (
            <tfoot>
              <tr>
                <td
                  className={cn(
                    'text-[10px] font-semibold text-base-content/70',
                    STICKY_NAME_TD,
                  )}
                >
                  Totals
                </td>
                {slots.map((s) => {
                  let { short, longTitle } = formatSlotCounts(rows, s.id)
                  return (
                    <td
                      key={s.id}
                      title={longTitle}
                      className="text-center text-[10px] text-base-content/60"
                    >
                      {short}
                    </td>
                  )
                })}
                {showComments ? <td /> : null}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {rows.length > 0 ? (
        <p className="text-[10px] text-base-content/45">
          Totals: <span className="font-medium">Y</span> yes ·{' '}
          <span className="font-medium">M</span> maybe ·{' '}
          <span className="font-medium">N</span> no. Hover a total for full
          counts.
        </p>
      ) : null}
      {onEdit && rows.length > 0 ? (
        <p className="text-xs text-base-content/40">
          Click a name to edit their response.
        </p>
      ) : null}
    </section>
  )
}

function VoteBadge({ value }: { value?: string }) {
  let v = (value || '').toLowerCase()
  let letter = v === 'yes' ? 'Y' : v === 'maybe' ? 'M' : v === 'no' ? 'N' : '—'
  let title =
    v === 'yes' ? 'Yes' : v === 'maybe' ? 'Maybe' : v === 'no' ? 'No' : ''
  let cls =
    v === 'yes'
      ? 'bg-success/20 text-success'
      : v === 'maybe'
        ? 'bg-warning/25 text-warning'
        : v === 'no'
          ? 'bg-base-300/50 text-base-content/55'
          : 'text-base-content/35'
  return (
    <span
      title={title || undefined}
      className={cn(
        'inline-flex min-w-4 justify-center rounded px-0.5 py-0 text-[10px] font-semibold tabular-nums',
        cls,
      )}
    >
      {letter}
    </span>
  )
}
