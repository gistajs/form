import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useFetcher } from 'react-router'
import {
  AvailabilityCandidatesSection,
  type AvailabilityCandidatesHandle,
} from '~/features/form/availability-poll/candidates/section'
import type { FormSelect } from '~/features/form/types'

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<'form'>['onSubmit']>
>[0]

type AvailabilityFormProps = {
  form: FormSelect
  /** Fires on every candidate-lines change so Live Preview can mirror unsaved lines. */
  onPreviewCandidateLines?: (lines: string) => void
}

export function AvailabilityForm({
  form,
  onPreviewCandidateLines,
}: AvailabilityFormProps) {
  let poll = form.kind === 'availability_poll' ? form.config : null
  if (!poll) return null

  let availabilityTimeZone = poll.time_zone

  let fetcher = useFetcher()
  let busy = fetcher.state !== 'idle'

  let [candidateLines, setCandidateLines] = useState(poll.candidate_lines)
  let [readonlyResponses, setReadonlyResponses] = useState(
    Boolean(poll.readonly_responses),
  )
  let candidatesRef = useRef<AvailabilityCandidatesHandle>(null)

  useEffect(() => {
    setCandidateLines(poll.candidate_lines)
    setReadonlyResponses(Boolean(poll.readonly_responses))
  }, [poll.candidate_lines, poll.readonly_responses])

  function handleFormSubmit(e: FormSubmitEvent) {
    e.preventDefault()
    let canonical = candidatesRef.current?.flushToCanonical() ?? candidateLines
    setCandidateLines(canonical)
    onPreviewCandidateLines?.(canonical)
    let fd = new FormData()
    fd.set('verb', 'update_availability_poll')
    fd.set('availability_poll_time_zone', availabilityTimeZone)
    fd.set('candidate_lines', canonical)
    if (readonlyResponses) fd.set('availability_poll_readonly_responses', 'on')
    fetcher.submit(fd, { method: 'post' })
  }

  return (
    <fetcher.Form
      method="POST"
      className="w-full min-w-0"
      onSubmit={handleFormSubmit}
    >
      <AvailabilityCandidatesSection
        ref={candidatesRef}
        timeZone={availabilityTimeZone}
        variant="saved"
        candidateLines={candidateLines}
        onCandidateLinesChange={(next) => {
          setCandidateLines(next)
          onPreviewCandidateLines?.(next)
        }}
        trailing={
          <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <label className="label cursor-pointer justify-start gap-2 py-0 sm:mr-auto">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={readonlyResponses}
                onChange={(e) => setReadonlyResponses(e.target.checked)}
              />
              <span className="label-text text-xs text-base-content/70">
                Lock responses (only you can edit)
              </span>
            </label>
            <button
              type="submit"
              className="btn w-fit shrink-0 btn-primary"
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Save schedule'}
            </button>
          </div>
        }
      />
    </fetcher.Form>
  )
}
