import { dataWithError, redirectWithSuccess } from 'remix-toast'
import { requireUser } from '~/.server/auth/middlewares'
import {
  AVAILABILITY_POLL_MAX_CANDIDATE_LINES,
  countNonEmptyCandidateLines,
  sortCandidateLinesByStartTime,
} from '~/features/form/availability-poll/parse-candidates'
import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import { isUsableAvailabilityTimeZone } from '~/features/form/availability-poll/time'
import { parseFormScaffold } from '~/features/form/scaffold'
import { Form } from '~/models/.server/form'
import type { ActionData } from './types'

export async function action({ request, context }) {
  let user = requireUser(context)
  let formData = await request.formData()
  let scaffold = parseFormScaffold(String(formData.get('scaffold') || ''))

  if (!scaffold) {
    return {
      formError: 'Invalid form scaffold.',
    } satisfies ActionData
  }

  if (!scaffold.name) {
    return {
      errors: {
        name: ['Name is required'],
      },
    } satisfies ActionData
  }

  let poll = scaffold.kind === 'availability_poll' ? scaffold.config : null

  if (scaffold.kind === 'availability_poll' && !poll) {
    return {
      formError: 'Missing schedule configuration.',
    } satisfies ActionData
  }

  if (poll) {
    if (!isUsableAvailabilityTimeZone(poll.time_zone)) {
      return {
        formError: 'Unsupported or invalid time zone.',
      } satisfies ActionData
    }

    poll.candidate_lines = sortCandidateLinesByStartTime(
      poll.candidate_lines,
      poll.time_zone,
    )

    let n = countNonEmptyCandidateLines(poll.candidate_lines)
    if (n > AVAILABILITY_POLL_MAX_CANDIDATE_LINES) {
      return {
        formError: `At most ${AVAILABILITY_POLL_MAX_CANDIDATE_LINES} non-empty lines allowed.`,
      } satisfies ActionData
    }

    if (buildAvailabilityPollSlots(poll).length < 1) {
      return {
        formError:
          'Add at least one non-empty line so there is something to vote on.',
      } satisfies ActionData
    }
  }

  let form = await Form.create(user.id, {
    name: scaffold.name,
    description: scaffold.description || null,
    fields: scaffold.fields,
    kind: scaffold.kind,
    config: scaffold.config,
    status: 'draft',
  })

  return redirectWithSuccess(`/forms/${form.public_id}`, 'Form saved')
}
