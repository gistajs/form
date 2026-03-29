import { useState, type ReactNode } from 'react'
import { cn } from '~/lib/cn'
import type { AvailabilityPollSlot } from './slots'
import { groupSlotsByDay } from './slots'

export const availabilityPollVoteTableDense =
  'table table-sm [&_th]:px-1.5 [&_td]:px-1.5 [&_th]:py-1 [&_td]:py-1'

type AvailabilityPollSlotsVoteTableProps = {
  slots: AvailabilityPollSlot[]
  timeZone: string
  children: ReactNode
}

export function AvailabilityPollSlotsVoteTable({
  slots,
  timeZone,
  children,
}: AvailabilityPollSlotsVoteTableProps) {
  let days = groupSlotsByDay(slots, timeZone)
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300/80">
      <table className={availabilityPollVoteTableDense}>
        <thead>
          <tr>
            {days.map((day) => (
              <th
                key={day.date}
                colSpan={day.slots.length}
                className="bg-base-200/80 text-center text-[10px] leading-tight font-medium whitespace-normal"
              >
                {day.dateLabel}
              </th>
            ))}
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
        {children}
      </table>
    </div>
  )
}

const PREVIEW_VOTES = ['yes', 'maybe', 'no'] as const
const PREVIEW_LETTER: Record<(typeof PREVIEW_VOTES)[number], string> = {
  yes: 'Y',
  maybe: 'M',
  no: 'N',
}

export function AvailabilityPollVoteTablePreviewBody({
  slots,
}: {
  slots: AvailabilityPollSlot[]
}) {
  return (
    <tbody>
      <tr>
        {slots.map((slot) => (
          <PreviewVoteCell key={slot.id} />
        ))}
      </tr>
    </tbody>
  )
}

function PreviewVoteCell() {
  let [selected, setSelected] = useState<(typeof PREVIEW_VOTES)[number] | null>(
    null,
  )

  return (
    <td className="p-1 align-top">
      <div className="flex min-w-10 flex-col gap-0.5">
        {PREVIEW_VOTES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setSelected(v)}
            className={cn(
              'btn min-h-7 w-full border px-0 text-[10px] font-bold btn-xs',
              selected === v
                ? v === 'yes'
                  ? 'btn-success'
                  : v === 'maybe'
                    ? 'btn-warning'
                    : 'border-base-content/25 bg-base-300/50! text-base-content/65! hover:bg-base-300/60!'
                : 'border-base-300/55 text-base-content/65 btn-ghost btn-outline',
            )}
          >
            {PREVIEW_LETTER[v]}
          </button>
        ))}
      </div>
    </td>
  )
}
