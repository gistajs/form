import { CheckCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Form, useActionData, useLoaderData } from 'react-router'
import { dataWithError, dataWithSuccess } from 'remix-toast'
import {
  assertPublished,
  resolveForm,
} from '~/features/form/.server/capability'
import {
  loadAvailabilityPollSubmissions,
  submitAvailabilityPollResponse,
} from '~/features/form/availability-poll/.server/submit'
import { AvailabilityPollFill } from '~/features/form/availability-poll/fill'
import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import { buildSubmissionData } from '~/features/form/submission'
import type { Field } from '~/features/form/types'
import { payloadFromRequest } from '~/lib/data/payload'
import { Submission } from '~/models/.server/submission'
import { FormPreview } from '~/routes/forms/$public_id/+/preview/form-preview'

export async function loader({ params }) {
  let { userId, form } = await resolveForm(params.public_id)
  assertPublished(form)
  let poll = form.kind === 'availability_poll' ? form.config : null
  let submissions = poll ? await loadAvailabilityPollSubmissions(form.id) : []
  let slots = poll ? buildAvailabilityPollSlots(poll) : []
  return { form, submissions, slots }
}

export async function action({ request, params }) {
  let { userId, form } = await resolveForm(params.public_id)
  assertPublished(form)

  let payload = await payloadFromRequest(request)
  let poll = form.kind === 'availability_poll' ? form.config : null

  if (poll) {
    let result = await submitAvailabilityPollResponse({
      formId: form.id,
      poll,
      payload,
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
  let { form, submissions, slots } = useLoaderData<typeof loader>()
  let actionData = useActionData<typeof action>()
  let [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (actionData?.submitted) setSubmitted(true)
  }, [actionData?.submitted])

  if (submitted) {
    return (
      <div className="mx-auto min-h-[60vh] max-w-lg px-4 py-12 text-center">
        <CheckCircleIcon className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-xl font-bold">Thank you!</h2>
        <p className="mt-2 text-sm text-base-content/60">
          Your response has been recorded.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setSubmitted(false)}
          >
            Submit another
          </button>
        </div>
      </div>
    )
  }

  let poll = form.kind === 'availability_poll' ? form.config : null

  if (poll) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Form method="POST" className="mt-4 space-y-4">
          <AvailabilityPollFill
            formName={form.name}
            formDescription={form.description}
            timeZone={poll.time_zone}
            slots={slots}
            submissions={submissions}
            readonlyResponses={Boolean(poll.readonly_responses)}
          />
        </Form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Form method="POST" className="mt-4 space-y-4">
        <FormPreview form={form} card={false} showBadge={false} />
      </Form>
    </div>
  )
}
