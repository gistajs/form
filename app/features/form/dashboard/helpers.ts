import type { FormSelect, SubmissionSelect } from '~/features/form/types'
import { buildAvailabilityPollSlots } from '../availability-poll/slots'

export function buildDashboard(
  forms: FormSelect[],
  submissions: SubmissionSelect[],
) {
  let counts = submissions.reduce<Record<number, number>>((acc, submission) => {
    acc[submission.form_id] = (acc[submission.form_id] || 0) + 1
    return acc
  }, {})

  return forms
    .map((form) => {
      let poll = form.kind === 'availability_poll' ? form.config : null

      return {
        public_id: form.public_id,
        name: form.name,
        description: form.description,
        status: form.status,
        fields: form.fields || [],
        kind: form.kind ?? null,
        config: form.config ?? null,
        fields_summary: poll
          ? `${buildAvailabilityPollSlots(poll).length} time slots`
          : `${form.fields?.length || 0} fields`,
        submission_count: counts[form.id] || 0,
        updated_at: form.updated_at,
        created_at: form.created_at,
      }
    })
    .sort(
      (a, b) =>
        toTime(b.updated_at || b.created_at) -
        toTime(a.updated_at || a.created_at),
    )
}

function toTime(date: any) {
  return new Date(date).getTime()
}
