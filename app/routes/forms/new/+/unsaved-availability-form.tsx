import type { Ref } from 'react'
import {
  AvailabilityCandidatesSection,
  type AvailabilityCandidatesHandle,
} from '~/features/form/availability-poll/candidates/section'
import type { FormConfig } from '~/features/form/form-types'

type UnsavedAvailabilityFormProps = {
  ref?: Ref<AvailabilityCandidatesHandle | null>
  config: FormConfig
  onChange: (config: FormConfig) => void
}

export function UnsavedAvailabilityForm({
  ref,
  config,
  onChange,
}: UnsavedAvailabilityFormProps) {
  if (!config) {
    return (
      <p className="text-sm text-base-content/50">
        This availability poll scaffold is missing its default schedule
        configuration.
      </p>
    )
  }

  let poll = config

  return (
    <div className="w-full min-w-0 pb-2">
      <AvailabilityCandidatesSection
        ref={ref}
        timeZone={poll.time_zone}
        variant="draft"
        candidateLines={poll.candidate_lines}
        onCandidateLinesChange={(candidate_lines) =>
          onChange({ ...poll, candidate_lines })
        }
      />
    </div>
  )
}
