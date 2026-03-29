import { EyeIcon, SendIcon } from 'lucide-react'
import { AvailabilitySectionHeader } from '~/features/form/availability-poll/fill'
import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import {
  AvailabilityPollSlotsVoteTable,
  AvailabilityPollVoteTablePreviewBody,
} from '~/features/form/availability-poll/slots-vote-table'
import type { FormSelect } from '~/features/form/types'
import { PreviewField } from './preview-field'

export function FormPreview({
  form,
  submitLabel = 'Submit',
  readOnly = false,
  className = '',
  title = 'Live Preview',
  showBadge = true,
  card = true,
}: FormPreviewProps) {
  let fields = form.fields || []
  let isCard = card && !className
  let poll = form.kind === 'availability_poll' ? form.config : null
  let availabilityPollSlots = poll ? buildAvailabilityPollSlots(poll) : []

  if (poll) {
    return (
      <div
        className={
          className ||
          (isCard
            ? 'rounded-2xl border border-base-300/60 bg-base-100 shadow-sm'
            : '')
        }
      >
        {isCard && (
          <div className="h-1.5 rounded-t-2xl bg-linear-to-r from-primary/80 via-primary/40 to-transparent" />
        )}
        <div className={isCard ? 'p-6 pt-5' : ''}>
          {isCard && showBadge && (
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-base-300/50 bg-base-200/50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-base-content/40 uppercase">
              <EyeIcon className="size-3" />
              {title}
            </div>
          )}
          <h3 className="text-xl font-bold tracking-tight">{form.name}</h3>
          {form.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-base-content/50">
              {form.description}
            </p>
          )}
          <div className="divider my-1 opacity-50" />
          <section className="space-y-4">
            <AvailabilitySectionHeader
              title="Your availability"
              timeZone={poll.time_zone}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text text-sm font-medium">Name</span>
                <input
                  type="text"
                  className="input-bordered input w-full"
                  placeholder="Your name"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text text-sm font-medium">Comment</span>
                <input
                  type="text"
                  className="input-bordered input w-full"
                  placeholder="Optional, visible to everyone"
                />
              </label>
            </div>
            {availabilityPollSlots.length === 0 ? (
              <p className="text-sm text-base-content/40">
                No slots generated.
              </p>
            ) : (
              <>
                <AvailabilityPollSlotsVoteTable
                  slots={availabilityPollSlots}
                  timeZone={poll.time_zone}
                >
                  <AvailabilityPollVoteTablePreviewBody
                    slots={availabilityPollSlots}
                  />
                </AvailabilityPollSlotsVoteTable>
                <p className="text-[10px] text-base-content/45">
                  Tap <span className="font-medium">Y</span> yes ·{' '}
                  <span className="font-medium">M</span> maybe ·{' '}
                  <span className="font-medium">N</span> no per slot.
                </p>
              </>
            )}
          </section>
          {!readOnly && availabilityPollSlots.length > 0 && (
            <div className="mt-8">
              <button
                type="submit"
                className="btn btn-block gap-2 rounded-xl btn-primary"
              >
                {submitLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        className ||
        (isCard
          ? 'rounded-2xl border border-base-300/60 bg-base-100 shadow-sm'
          : '')
      }
    >
      {/* Header accent bar */}
      {isCard && (
        <div className="h-1.5 rounded-t-2xl bg-linear-to-r from-primary/80 via-primary/40 to-transparent" />
      )}

      <div className={isCard ? 'p-6 pt-5' : ''}>
        {/* Preview badge */}
        {isCard && showBadge && (
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-base-300/50 bg-base-200/50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-base-content/40 uppercase">
            <EyeIcon className="size-3" />
            {title}
          </div>
        )}

        {/* Form title & description */}
        <h3 className="text-xl font-bold tracking-tight">{form.name}</h3>
        {form.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-base-content/50">
            {form.description}
          </p>
        )}

        {/* Divider */}
        {fields.length > 0 && (
          <div className="mt-5 border-t border-base-300/40" />
        )}

        {/* Fields */}
        <div className="mt-5 space-y-5">
          {fields.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="rounded-xl bg-base-200/50 p-3">
                <SendIcon className="size-5 text-base-content/20" />
              </div>
              <p className="text-sm text-base-content/30">
                Add fields to see them here
              </p>
            </div>
          )}
          {fields.map((field) => (
            <PreviewField key={field.key} field={field} />
          ))}
        </div>

        {/* Submit button */}
        {!readOnly && fields.length > 0 && (
          <div className="mt-8">
            <button
              type="submit"
              className="btn btn-block gap-2 rounded-xl btn-primary"
            >
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type FormPreviewProps = {
  form: FormSelect
  submitLabel?: string
  readOnly?: boolean
  className?: string
  title?: string
  showBadge?: boolean
  /** Default true: bordered card chrome. False: bare layout (e.g. public fill page). */
  card?: boolean
}
