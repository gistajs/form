import { BarChart3Icon, CheckIcon, InboxIcon, TableIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from 'react-router'
import { requireUser } from '~/.server/auth/middlewares'
import { AvailabilityPollResultsTable } from '~/features/form/availability-poll/results-table'
import {
  buildAvailabilityPollSlots,
  type AvailabilityPollSlot,
} from '~/features/form/availability-poll/slots'
import { aggregateAvailabilityPollVotes } from '~/features/form/availability-poll/votes'
import {
  formatLegacyGridSubmission,
  hasGridDrift,
  parseStoredGridSubmission,
} from '~/features/form/grid-submission'
import {
  radioOptionPrimaries,
  radioOptionsFromField,
} from '~/features/form/radio/utils'
import type { Field, FormSelect, SubmissionSelect } from '~/features/form/types'
import { cn } from '~/lib/cn'
import { Form } from '~/models/.server/form'
import { Submission } from '~/models/.server/submission'

export async function loader({ params, context }) {
  let user = requireUser(context)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })

  let submissions = await Submission.findAllBy({
    form_id: form.id,
  })
  submissions.sort((a, b) => b.id - a.id)

  return { submissions }
}

export default function Page() {
  let navigate = useNavigate()
  let { form } = useOutletContext<{ form: FormSelect }>()
  let { submissions } = useLoaderData<typeof loader>()
  let fields = form.fields || []
  let poll = form.kind === 'availability_poll' ? form.config : null
  let availabilityPollSlots = poll ? buildAvailabilityPollSlots(poll) : []
  let [view, setView] = useState<'table' | 'summary'>('table')

  return (
    <>
      <div className="flex flex-wrap items-center gap-8">
        <p className="text-sm text-base-content/60">
          {submissions.length} total submissions
        </p>
        <div className="flex items-center gap-2">
          <div className="join">
            <button
              className={`btn join-item btn-sm ${view === 'table' ? 'btn-active' : ''}`}
              onClick={() => setView('table')}
            >
              <TableIcon className="size-3.5" />
              Table
            </button>
            <button
              className={`btn join-item btn-sm ${view === 'summary' ? 'btn-active' : ''}`}
              onClick={() => setView('summary')}
            >
              <BarChart3Icon className="size-3.5" />
              Summary
            </button>
          </div>
          {form.status === 'published' && (
            <Link
              to={`/forms/${form.public_id}/preview`}
              className="btn btn-sm btn-primary"
            >
              Add Response
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6">
        {view === 'table' ? (
          poll ? (
            submissions.length === 0 ? (
              <SubmissionsEmptyState />
            ) : (
              <div className="overflow-x-auto">
                <AvailabilityPollResultsTable
                  slots={availabilityPollSlots}
                  submissions={submissions}
                  timeZone={poll.time_zone}
                  showComments
                  onEdit={(row) =>
                    navigate(
                      `/forms/${form.public_id}/preview?edit=${row.subId}`,
                    )
                  }
                />
              </div>
            )
          ) : (
            <SubmissionTable fields={fields} submissions={submissions} />
          )
        ) : poll ? (
          <AvailabilityPollSubmissionSummary
            slots={availabilityPollSlots}
            submissions={submissions}
          />
        ) : (
          <SubmissionSummary fields={fields} submissions={submissions} />
        )}
      </div>
    </>
  )
}

function SubmissionTable({ fields, submissions }: ViewProps) {
  if (submissions.length === 0) {
    return <SubmissionsEmptyState />
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>#</th>
            {fields.map((f) => (
              <th key={f.key}>{f.label}</th>
            ))}
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, i) => {
            let data = (sub.data || {}) as Record<string, string>
            return (
              <tr key={sub.id}>
                <td className="text-base-content/50">
                  {submissions.length - i}
                </td>
                {fields.map((f) => (
                  <td
                    key={f.key}
                    className={
                      f.type === 'grid_radio' || f.type === 'grid_checkbox'
                        ? 'max-w-xl min-w-48 align-top text-xs whitespace-normal'
                        : 'max-w-48 truncate'
                    }
                  >
                    {f.type === 'grid_radio' || f.type === 'grid_checkbox' ? (
                      <GridAnswerMatrix field={f} raw={data[f.key]} />
                    ) : (
                      formatSubmissionCell(f, data[f.key])
                    )}
                  </td>
                ))}
                <td className="text-xs text-base-content/50">
                  {formatDate(sub.created_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AvailabilityPollSubmissionSummary({
  slots,
  submissions,
}: {
  slots: AvailabilityPollSlot[]
  submissions: SubmissionSelect[]
}) {
  if (submissions.length === 0) {
    return <SubmissionsEmptyState />
  }

  let dayCounts = getDayCounts(submissions, 14)
  let maxDay = Math.max(...Object.values(dayCounts), 1)
  let voteTotals = aggregateAvailabilityPollVotes(slots, submissions)

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h3 className="mb-3 text-sm font-medium">Responses per day</h3>
        <div className="flex items-end gap-1" style={{ height: '120px' }}>
          {Object.entries(dayCounts).map(([date, count]) => (
            <div
              key={date}
              className="group relative flex-1"
              style={{ height: '100%' }}
            >
              <div
                className="absolute bottom-0 w-full rounded-t bg-primary/70"
                style={{
                  height: `${(count / maxDay) * 100}%`,
                  minHeight: count > 0 ? '4px' : '0',
                }}
              />
              <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-xs group-hover:block">
                {count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-base-content/40">
          <span>{Object.keys(dayCounts)[0]}</span>
          <span>Today</span>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-base-content/50">
          No time slots in this poll.
        </p>
      ) : (
        <div className="space-y-8">
          <h3 className="text-sm font-medium">Availability by time slot</h3>
          {slots.map((slot) => {
            let c = voteTotals[slot.id] || { yes: 0, maybe: 0, no: 0 }
            let maxVote = Math.max(c.yes, c.maybe, c.no, 1)
            return (
              <div key={slot.id}>
                <h4 className="mb-3 text-sm font-medium text-base-content/80">
                  {slot.label}
                </h4>
                <div className="space-y-2">
                  {(
                    [
                      ['yes', 'bg-success/70', c.yes],
                      ['maybe', 'bg-warning/70', c.maybe],
                      ['no', 'bg-base-300/90', c.no],
                    ] as const
                  ).map(([label, barCls, count]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-14 text-sm capitalize">{label}</span>
                      <div className="flex-1">
                        <div
                          className={cn('h-5 rounded', barCls)}
                          style={{
                            width: `${(count / maxVote) * 100}%`,
                            minWidth: count > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm text-base-content/60">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SubmissionSummary({ fields, submissions }: ViewProps) {
  if (submissions.length === 0) {
    return <SubmissionsEmptyState />
  }

  // Per-day distribution (last 14 days)
  let dayCounts = getDayCounts(submissions, 14)
  let maxDay = Math.max(...Object.values(dayCounts), 1)

  // Field distributions for select / radio
  let choiceFields = fields.filter(
    (f) => (f.type === 'select' || f.type === 'radio') && f.options?.length,
  )

  return (
    <div className="max-w-lg space-y-8">
      {/* Daily submissions */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Submissions per day</h3>
        <div className="flex items-end gap-1" style={{ height: '120px' }}>
          {Object.entries(dayCounts).map(([date, count]) => (
            <div
              key={date}
              className="group relative flex-1"
              style={{ height: '100%' }}
            >
              <div
                className="absolute bottom-0 w-full rounded-t bg-primary/70"
                style={{
                  height: `${(count / maxDay) * 100}%`,
                  minHeight: count > 0 ? '4px' : '0',
                }}
              />
              <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-xs group-hover:block">
                {count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-base-content/40">
          <span>{Object.keys(dayCounts)[0]}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Choice field distributions */}
      {choiceFields.map((field) => {
        let dist = getDistribution(field, submissions)
        let maxCount = Math.max(...Object.values(dist), 1)

        return (
          <div key={field.key}>
            <h3 className="mb-3 text-sm font-medium">{field.label}</h3>
            <div className="space-y-2">
              {Object.entries(dist).map(([value, count]) => (
                <div key={value} className="flex items-center gap-3">
                  <span className="w-20 truncate text-sm">{value}</span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded bg-primary/60"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        minWidth: count > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-base-content/60">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatSubmissionCell(field: Field, raw: string | undefined) {
  if (raw === undefined || raw === '') return '—'
  return raw
}

function GridAnswerMatrix({
  field,
  raw,
}: {
  field: Field
  raw: string | undefined
}) {
  if (raw === undefined || raw === '') {
    return <span className="text-base-content/50">—</span>
  }
  let parsed = parseStoredGridSubmission(field, raw)
  let rows = field.rows || []
  let cols = field.columns || []
  if (!parsed.ok) {
    return (
      <span className="wrap-break-word whitespace-pre-wrap text-base-content/70">
        {parsed.display}
      </span>
    )
  }
  if (rows.length === 0 || cols.length === 0 || parsed.byRow.size === 0) {
    return <span className="text-base-content/50">—</span>
  }
  if (hasGridDrift(parsed, rows.length, cols.length)) {
    return (
      <span className="wrap-break-word whitespace-pre-wrap text-base-content/70">
        {formatLegacyGridSubmission(field, parsed)}
      </span>
    )
  }
  return (
    <div className="inline-block max-w-full min-w-max rounded-lg border border-base-300/60 bg-base-200/25 p-2">
      <table className="table border-collapse table-sm text-[10px] [&_td]:px-1 [&_td]:py-1 [&_th]:px-1 [&_th]:py-1">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-24 min-w-18 bg-base-200/80 font-medium normal-case"
            />
            {cols.map((colLabel, j) => (
              <th
                key={j}
                scope="col"
                className="max-w-24 min-w-10 text-center leading-tight font-medium whitespace-normal normal-case"
              >
                {colLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowLabel, ri) => (
            <tr key={ri}>
              <th
                scope="row"
                className="max-w-36 bg-base-100 text-left font-normal whitespace-normal"
              >
                {rowLabel}
              </th>
              {cols.map((_, cj) => {
                let selected =
                  parsed.variant === 'radio'
                    ? parsed.byRow.get(ri) === cj
                    : (parsed.byRow.get(ri) ?? []).includes(cj)
                return (
                  <td key={cj} className="text-center align-middle">
                    {parsed.variant === 'radio' ? (
                      <span className="inline-flex size-6 items-center justify-center">
                        {selected ? (
                          <span
                            className="inline-block size-2.5 rounded-full bg-primary"
                            aria-label="Selected"
                          />
                        ) : (
                          <span className="inline-block size-2 rounded-full border border-base-300/80 bg-base-100" />
                        )}
                      </span>
                    ) : selected ? (
                      <CheckIcon
                        className="mx-auto size-3.5 text-primary"
                        strokeWidth={2.5}
                        aria-label="Selected"
                      />
                    ) : (
                      <span className="inline-block size-3" aria-hidden />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getDayCounts(submissions: SubmissionSelect[], days: number) {
  let counts: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    let d = new Date(Date.now() - i * 86400000)
    let key = `${d.getMonth() + 1}/${d.getDate()}`
    counts[key] = 0
  }

  for (let sub of submissions) {
    let d = new Date(sub.created_at as any)
    let key = `${d.getMonth() + 1}/${d.getDate()}`
    if (key in counts) counts[key]++
  }

  return counts
}

function getDistribution(field: Field, submissions: SubmissionSelect[]) {
  let dist: Record<string, number> = {}
  let optionKeys: string[] =
    field.type === 'select'
      ? ((field.options || []) as string[])
      : field.type === 'radio'
        ? radioOptionPrimaries(radioOptionsFromField(field))
        : []
  for (let opt of optionKeys) dist[opt] = 0

  for (let sub of submissions) {
    let data = (sub.data || {}) as Record<string, string>
    let val = data[field.key]
    if (val && val in dist) dist[val]++
  }

  return dist
}

function formatDate(date: any) {
  let d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SubmissionsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300 bg-base-200/25 px-6 py-16 text-center sm:py-20"
      role="status"
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-base-300/35 text-base-content/45">
        <InboxIcon className="size-8 stroke-[1.25]" />
      </div>
      <p className="text-lg font-semibold tracking-tight text-base-content sm:text-xl">
        No submissions yet
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/60">
        When someone submits your published form, responses appear in the table
        and summary here.
      </p>
    </div>
  )
}

type ViewProps = {
  fields: Field[]
  submissions: SubmissionSelect[]
}
