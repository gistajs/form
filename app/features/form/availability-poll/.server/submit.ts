import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import type { SubmissionSelect } from '~/features/form/types'
import { Submission } from '~/models/.server/submission'

const AVAIL = new Set(['yes', 'no', 'maybe'])

export function parseAvailabilityPollFormPayload(
  payload: Record<string, any>,
  slotIds: string[],
):
  | {
      ok: true
      name: string
      comment: string
      availability: Record<string, string>
    }
  | { ok: false; message: string } {
  let name = String(payload.respondent_name || '').trim()
  if (!name) return { ok: false, message: 'Name is required' }

  let comment = String(payload.comment || '').trim()
  let availability: Record<string, string> = {}

  for (let id of slotIds) {
    let v = String(payload[`avail_${id}`] || '')
      .trim()
      .toLowerCase()
    if (!v) continue
    if (!AVAIL.has(v)) {
      return { ok: false, message: 'Invalid availability for a time slot' }
    }
    availability[id] = v
  }

  return { ok: true, name, comment, availability }
}

/** New save: `partial` only. Edit: keep prior answers for slots not in `partial`. */
export function mergeAvailabilityPollAvailability(
  partial: Record<string, string>,
  previousJson: string | null | undefined,
  slotIds: string[],
): Record<string, string> {
  let prev: Record<string, string> = {}
  if (previousJson) {
    try {
      prev = JSON.parse(previousJson) as Record<string, string>
    } catch {
      prev = {}
    }
  }
  let set = new Set(slotIds)
  let base: Record<string, string> = {}
  for (let id of slotIds) {
    let v = String(prev[id] || '')
      .trim()
      .toLowerCase()
    if (AVAIL.has(v)) base[id] = v
  }
  return { ...base, ...partial }
}

export async function submitAvailabilityPollResponse({
  formId,
  poll,
  payload,
  /** Logged-in form owner editing from /preview; bypasses readonly_responses on updates. */
  allowOwnerEdit = false,
}: {
  formId: number
  poll: {
    time_zone: string
    candidate_lines: string
    readonly_responses: boolean
  }
  payload: Record<string, any>
  allowOwnerEdit?: boolean
}): Promise<
  | {
      ok: true
      submitted: true
      message: 'Response submitted' | 'Response updated'
    }
  | { ok: false; message: string }
> {
  let slots = buildAvailabilityPollSlots(poll)
  let ids = slots.map((s) => s.id)
  let parsed = parseAvailabilityPollFormPayload(payload, ids)
  if (!parsed.ok) {
    return parsed
  }

  let editId = Number(payload.submission_id)
  // Read-only blocks updates only; new responses (no submission_id) stay allowed.
  if (editId > 0 && poll.readonly_responses && !allowOwnerEdit) {
    return {
      ok: false,
      message: 'Existing responses cannot be edited for this poll.',
    }
  }

  let prevJson: string | null | undefined
  if (editId > 0) {
    let subs = await Submission.findAllBy({ form_id: formId })
    let ex = subs.find((s) => s.id === editId)
    prevJson = ex?.data
      ? String((ex.data as Record<string, string>).availability || '')
      : undefined
  }

  let availability = mergeAvailabilityPollAvailability(
    parsed.availability,
    editId > 0 ? prevJson : undefined,
    ids,
  )
  let submissionData = {
    name: parsed.name,
    comment: parsed.comment,
    availability: JSON.stringify(availability),
  }

  if (editId > 0) {
    await Submission.update(editId, { data: submissionData })
    return { ok: true, submitted: true, message: 'Response updated' }
  }

  await Submission.create({
    form_id: formId,
    data: submissionData,
  })
  return { ok: true, submitted: true, message: 'Response submitted' }
}

export async function loadAvailabilityPollSubmissions(formId: number) {
  let submissions: SubmissionSelect[] = await Submission.findAllBy({
    form_id: formId,
  })
  submissions.sort((a, b) => b.id - a.id)
  return submissions
}
