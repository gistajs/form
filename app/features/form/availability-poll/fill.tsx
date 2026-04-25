import { Fragment, useRef, useState } from 'react'
import type { SubmissionSelect } from '~/features/form/types'
import { cn } from '~/lib/cn'
import { AvailabilityPollResultsTable } from './results-table'
import type { AvailabilityPollSlot } from './slots'
import { AvailabilityPollSlotsVoteTable } from './slots-vote-table'
import { parseSubmissionRow, type ParsedAvailabilityPollRow } from './votes'

type EditingState = {
  subId: number
  name: string
  comment: string
  votes: Record<string, string>
} | null

type AvailabilityPollFillProps = {
  formName: string
  formDescription: string | null
  timeZone: string
  slots: AvailabilityPollSlot[]
  submissions: SubmissionSelect[]
  /** When true, names in the results table are not clickable for editing. */
  readonlyResponses?: boolean
  /** When true (preview route), organizer can still edit rows despite readonlyResponses. */
  ownerPreview?: boolean
  /** Open preview already in edit mode for this submission (organizer). */
  initialEditSubmissionId?: number | null
}

const VOTE_OPTIONS = ['yes', 'maybe', 'no'] as const

const VOTE_LETTER: Record<(typeof VOTE_OPTIONS)[number], string> = {
  yes: 'Y',
  maybe: 'M',
  no: 'N',
}

function initialEditingFromUrl(
  initialEditSubmissionId: number | null | undefined,
  submissions: SubmissionSelect[],
  slots: AvailabilityPollSlot[],
): { editing: EditingState; expanded: boolean } {
  if (!initialEditSubmissionId) return { editing: null, expanded: false }
  for (let s of submissions) {
    let row = parseSubmissionRow(s, slots)
    if (row.subId === initialEditSubmissionId) {
      return {
        editing: {
          subId: row.subId,
          name: row.name,
          comment: row.comment,
          votes: row.votes,
        },
        expanded: true,
      }
    }
  }
  return { editing: null, expanded: false }
}

export function AvailabilityPollFill({
  formName,
  formDescription,
  timeZone,
  slots,
  submissions,
  readonlyResponses = false,
  ownerPreview = false,
  initialEditSubmissionId = null,
}: AvailabilityPollFillProps) {
  let init =
    initialEditSubmissionId != null
      ? initialEditingFromUrl(initialEditSubmissionId, submissions, slots)
      : { editing: null as EditingState, expanded: false }
  let [editing, setEditing] = useState<EditingState>(init.editing)
  let [expanded, setExpanded] = useState(init.expanded)
  let formRef = useRef<HTMLDivElement>(null)

  let respondentEditLocked = readonlyResponses && !ownerPreview

  function handleEdit(row: ParsedAvailabilityPollRow) {
    setEditing({
      subId: row.subId,
      name: row.name,
      comment: row.comment,
      votes: row.votes,
    })
    setExpanded(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleCancelEdit() {
    setEditing(null)
  }

  function handleCollapse() {
    setEditing(null)
    setExpanded(false)
  }

  return (
    <div className="space-y-10">
      <header>
        <h3 className="text-xl font-bold tracking-tight">{formName}</h3>
        {formDescription ? (
          <p className="mt-1.5 text-sm leading-relaxed text-base-content/50">
            {formDescription}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-base-content/55">
          Votes and comments below are visible to everyone with this link.
        </p>
        {respondentEditLocked ? (
          <p className="mt-2 text-sm text-base-content/55">
            Read-only here; new submissions still allowed.
          </p>
        ) : null}
        {readonlyResponses && ownerPreview ? (
          <p className="mt-2 text-sm text-base-content/55">
            You can edit below or in Submissions.
          </p>
        ) : null}
      </header>

      <AvailabilityPollResultsTable
        slots={slots}
        submissions={submissions}
        timeZone={timeZone}
        showComments
        onEdit={respondentEditLocked ? undefined : handleEdit}
      />

      <div className="divider my-1 opacity-50" />

      {!expanded ? (
        <div className="py-4 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="btn btn-wide rounded-xl btn-primary"
          >
            Add your availability
          </button>
        </div>
      ) : (
        <section ref={formRef} className="space-y-4">
          <AvailabilitySectionHeader
            title={
              editing
                ? `Editing ${editing.name}\u2019s response`
                : 'Your availability'
            }
            timeZone={timeZone}
          >
            <button
              type="button"
              onClick={editing ? handleCancelEdit : handleCollapse}
              className="btn btn-ghost btn-xs"
            >
              {editing ? 'Cancel' : 'Collapse'}
            </button>
          </AvailabilitySectionHeader>

          {editing ? (
            <input type="hidden" name="submission_id" value={editing.subId} />
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <span className="label-text text-sm font-medium">Name</span>
              <input
                key={editing?.subId ?? 'new'}
                type="text"
                name="respondent_name"
                required
                className="input-bordered input w-full"
                placeholder="Your name"
                defaultValue={editing?.name ?? ''}
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-sm font-medium">Comment</span>
              <input
                key={`c-${editing?.subId ?? 'new'}`}
                type="text"
                name="comment"
                className="input-bordered input w-full"
                placeholder="Optional, visible to everyone"
                defaultValue={editing?.comment ?? ''}
              />
            </label>
          </div>

          {slots.length > 0 ? (
            <>
              <AvailabilityPollSlotsVoteTable slots={slots} timeZone={timeZone}>
                <tbody>
                  <tr>
                    {slots.map((slot) => (
                      <SlotCell
                        key={`${slot.id}-${editing?.subId ?? 'new'}`}
                        slotId={slot.id}
                        initialValue={editing?.votes[slot.id] ?? null}
                      />
                    ))}
                  </tr>
                </tbody>
              </AvailabilityPollSlotsVoteTable>
              <p className="text-[10px] text-base-content/45">
                Tap <span className="font-medium">Y</span> yes ·{' '}
                <span className="font-medium">M</span> maybe ·{' '}
                <span className="font-medium">N</span> no per slot.
              </p>
            </>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              className="btn btn-block gap-2 rounded-xl btn-primary"
            >
              {editing ? 'Update' : 'Submit'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

type AvailabilitySectionHeaderProps = {
  title: string
  timeZone: string
  children?: React.ReactNode
}

export function AvailabilitySectionHeader({
  title,
  timeZone,
  children,
}: AvailabilitySectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
      <span className="flex-1 text-right text-xs text-base-content/40">
        All times in <span className="font-medium">{timeZone}</span>
      </span>
      {children}
    </div>
  )
}

type SlotCellProps = {
  slotId: string
  initialValue: string | null
}

function SlotCell({ slotId, initialValue }: SlotCellProps) {
  let [selected, setSelected] = useState<string | null>(initialValue)
  let name = `avail_${slotId}`

  return (
    <td className="p-1 align-top">
      <div className="flex min-w-10 flex-col gap-0.5">
        {VOTE_OPTIONS.map((v) => (
          <Fragment key={v}>
            <input
              type="radio"
              name={name}
              value={v}
              className="hidden"
              checked={selected === v}
              readOnly
            />
            <button
              type="button"
              title={v}
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
              {VOTE_LETTER[v]}
            </button>
          </Fragment>
        ))}
      </div>
    </td>
  )
}
