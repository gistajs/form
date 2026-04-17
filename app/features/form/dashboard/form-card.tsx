import { ClipboardListIcon, FileTextIcon } from 'lucide-react'
import { Link } from 'react-router'
import {
  buildAvailabilityPollSlots,
  groupSlotsByDay,
} from '~/features/form/availability-poll/slots'
import type { Field } from '~/features/form/types'
import { cn } from '~/lib/cn'
import type { DashboardForm } from './types'

export function FormCard({ form }: { form: DashboardForm }) {
  return (
    <Link
      to={`/forms/${form.public_id}`}
      className="group overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
    >
      <FormThumb form={form} />

      <div className="space-y-3 border-t border-base-200 px-5 pt-4 pb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-base-content/40">
            {formatDate(form.updated_at || form.created_at)}
          </span>
          <span
            className={cn(
              'badge badge-soft badge-sm',
              form.status === 'published' ? 'badge-success' : 'badge-ghost',
            )}
          >
            {form.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1.5">
            <ClipboardListIcon className="size-3.5 shrink-0 text-primary/70" />
            {form.fields_summary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileTextIcon className="size-3.5 shrink-0 text-primary/70" />
            {form.submission_count} submissions
          </span>
        </div>
      </div>
    </Link>
  )
}

function FormThumb({ form }: { form: DashboardForm }) {
  let fields = form.fields || []
  let poll = form.kind === 'availability_poll' ? form.config : null
  let grouped = poll
    ? groupSlotsByDay(buildAvailabilityPollSlots(poll), poll.time_zone)
    : []
  let days = grouped.slice(0, 2)
  let overflowDays = Math.max(0, grouped.length - days.length)

  return (
    <div className="relative h-48 overflow-hidden bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-base-200)_88%,white),color-mix(in_oklab,var(--color-base-300)_72%,white))]">
      <div className="absolute inset-x-0 top-0 h-2 bg-primary/70" />
      <div className="absolute top-5 right-5 left-5 rounded-2xl border border-white/60 bg-base-100/85 p-4 shadow-lg backdrop-blur-sm">
        <div className="mb-2.5">
          <h3 className="line-clamp-1 text-base font-semibold text-base-content transition-colors group-hover:text-primary">
            {form.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-base-content/50">
            {form.description || 'No description yet.'}
          </p>
        </div>
        {poll ? (
          <AvailabilityPollThumb days={days} overflowDays={overflowDays} />
        ) : (
          <FieldsThumb fields={fields} />
        )}
      </div>
    </div>
  )
}

function FieldsThumb({ fields }: { fields: Field[] }) {
  let previewFields = fields.slice(0, 3)
  let extraCount = Math.max(0, fields.length - previewFields.length)

  if (previewFields.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-base-300/80 bg-base-200/35 px-4 text-center text-xs text-base-content/40">
        Add fields to see a preview
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {previewFields.map((field) => (
        <FieldThumb key={field.key} field={field} />
      ))}
      {extraCount > 0 && (
        <div className="text-[11px] font-medium text-base-content/45">
          +{extraCount} more
        </div>
      )}
    </div>
  )
}

function FieldThumb({ field }: { field: Field }) {
  return (
    <div className="space-y-1">
      <div className="line-clamp-1 text-[11px] font-medium text-base-content/65">
        {field.label}
        {field.required ? (
          <span className="ml-0.5 text-error/60">*</span>
        ) : null}
      </div>
      {field.type === 'checkbox' ? (
        <div className="flex h-7 items-center gap-2 rounded-lg bg-base-200/60 px-2.5">
          <div className="size-3 rounded-sm border border-base-300 bg-base-100/80" />
          <div className="h-1.5 w-20 rounded-full bg-base-300/80" />
        </div>
      ) : field.type === 'textarea' ? (
        <div className="h-12 rounded-xl bg-base-200/80" />
      ) : field.type === 'select' ? (
        <div className="flex h-8 items-center justify-between rounded-xl bg-base-200/80 px-3">
          <div className="h-1.5 w-16 rounded-full bg-base-300/80" />
          <div className="text-[10px] text-base-content/35">▼</div>
        </div>
      ) : field.type === 'radio' ? (
        <div className="flex h-8 items-center gap-1.5 px-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-4 shrink-0 rounded-full border border-base-300 bg-base-100/80"
            />
          ))}
        </div>
      ) : (
        <div className="h-8 rounded-xl bg-base-200/80" />
      )}
    </div>
  )
}

function AvailabilityPollThumb({
  days,
  overflowDays,
}: {
  days: ReturnType<typeof groupSlotsByDay>
  overflowDays: number
}) {
  if (days.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-base-300/80 bg-base-200/35 px-4 text-center text-xs text-base-content/40">
        No time slots generated
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {days.map((day) => {
        let visibleSlots = day.slots.slice(0, 3)
        let overflowSlots = Math.max(0, day.slots.length - visibleSlots.length)

        return (
          <div
            key={day.date}
            className="rounded-lg border border-base-300/60 bg-base-200/30 p-2"
          >
            <div className="mb-1 text-[10px] font-semibold text-base-content/50">
              {day.dateLabel}
            </div>
            <div className="flex flex-wrap gap-1">
              {visibleSlots.map(({ slot, timeLabel, timeEndLabel }) => (
                <span
                  key={slot.id}
                  className="inline-flex flex-col items-center rounded-md bg-base-100/85 px-1.5 py-0.5 text-[10px] leading-tight text-base-content/60"
                >
                  <span>{timeLabel}</span>
                  {timeEndLabel ? (
                    <span className="text-[9px] text-base-content/50">
                      {timeEndLabel}
                    </span>
                  ) : null}
                </span>
              ))}
              {overflowSlots > 0 && (
                <span className="rounded-md bg-base-100/60 px-1.5 py-0.5 text-[10px] text-base-content/40">
                  +{overflowSlots}
                </span>
              )}
            </div>
          </div>
        )
      })}
      {overflowDays > 0 && (
        <div className="text-[11px] font-medium text-base-content/45">
          +{overflowDays} more days
        </div>
      )}
    </div>
  )
}

function formatDate(date: any) {
  let value = new Date(date)
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
