import { CheckCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Form as RouterForm,
  Link,
  useActionData,
  useLoaderData,
  useOutletContext,
} from 'react-router'
import { dataWithError, dataWithSuccess } from 'remix-toast'
import { requireUser } from '~/.server/auth/middlewares'
import {
  loadAvailabilityPollSubmissions,
  submitAvailabilityPollResponse,
} from '~/features/form/availability-poll/.server/submit'
import { AvailabilityPollFill } from '~/features/form/availability-poll/fill'
import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import { buildSubmissionData } from '~/features/form/submission'
import type { Field, FormSelect } from '~/features/form/types'
import { payloadFromRequest } from '~/lib/data/payload'
import { Form } from '~/models/.server/form'
import { Submission } from '~/models/.server/submission'
import { FormPreview } from './+/preview/form-preview'

export async function loader({ params, context, request }) {
  let user = requireUser(context)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })
  let poll = form.kind === 'availability_poll' ? form.config : null
  let submissions = poll ? await loadAvailabilityPollSubmissions(form.id) : []
  let editRaw = new URL(request.url).searchParams.get('edit')
  let initialEditSubmissionId =
    editRaw && /^\d+$/.test(editRaw) ? Number(editRaw) : null
  return { submissions, initialEditSubmissionId }
}

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })

  let poll = form.kind === 'availability_poll' ? form.config : null

  if (poll) {
    let result = await submitAvailabilityPollResponse({
      formId: form.id,
      poll,
      payload,
      allowOwnerEdit: true,
    })
    if (!result.ok) {
      return dataWithError(null, result.message)
    }
    return dataWithSuccess({ submitted: true }, result.message)
  }

  let fields = (form.fields || []) as Field[]
  let result = buildSubmissionData(fields, payload)
  if (!result.ok) {
    return dataWithError(null, result.error)
  }

  await Submission.create({
    form_id: form.id,
    data: result.data,
  })

  return dataWithSuccess({ submitted: true }, 'Response submitted')
}

export default function Page() {
  let { form } = useOutletContext<{ form: FormSelect }>()
  let { submissions, initialEditSubmissionId } = useLoaderData<typeof loader>()
  let actionData = useActionData<typeof action>()
  let [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (actionData?.submitted) setSubmitted(true)
  }, [actionData?.submitted])

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <CheckCircleIcon className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-xl font-bold">Thank you!</h2>
        <p className="mt-2 text-sm text-base-content/60">
          Your response has been recorded.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setSubmitted(false)}
          >
            Submit another
          </button>
          <Link
            to={`/forms/${form.public_id}/submissions`}
            className="btn btn-ghost btn-sm"
          >
            View submissions
          </Link>
        </div>
      </div>
    )
  }

  let poll = form.kind === 'availability_poll' ? form.config : null

  if (poll) {
    let slots = buildAvailabilityPollSlots(poll)
    return (
      <div className="mx-auto max-w-3xl">
        <RouterForm method="POST" className="mt-8 space-y-4">
          <AvailabilityPollFill
            key={initialEditSubmissionId ?? 'new'}
            formName={form.name}
            formDescription={form.description}
            timeZone={poll.time_zone}
            slots={slots}
            submissions={submissions}
            readonlyResponses={Boolean(poll.readonly_responses)}
            ownerPreview
            initialEditSubmissionId={initialEditSubmissionId}
          />
        </RouterForm>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <RouterForm method="POST" className="mt-8 space-y-4">
        <FormPreview form={form} card={false} />
      </RouterForm>
    </div>
  )
}
