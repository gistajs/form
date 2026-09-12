import { CopyIcon } from 'lucide-react'
import { Form as RouterForm, Link, useOutletContext } from 'react-router'
import { redirectWithSuccess } from 'remix-toast'
import { toast } from 'sonner'
import { requireUser } from '~/.server/auth/middlewares'
import type { FormSelect } from '~/features/form/types'
import { payloadFromRequest } from '~/lib/data/payload'
import { Form } from '~/models/.server/form'
import { DeleteButton } from '~/ui/delete-modal'
import { Field, Fieldset } from '~/ui/forms/fieldset'
import { useBusy } from '~/ui/hooks/use-busy'

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })

  switch (payload.verb) {
    case 'toggle_status': {
      let status: 'draft' | 'published' =
        form.status === 'published' ? 'draft' : 'published'
      await Form.update(user.id, form.id, {
        status,
      })
      return redirectWithSuccess(
        `/forms/${form.public_id}/settings`,
        `Form ${status}`,
      )
    }

    case 'delete_form': {
      await Form.delete(user.id, form.id)
      return redirectWithSuccess('/forms', 'Form deleted')
    }
  }

  return null
}

export default function Page() {
  let { form } = useOutletContext<{ form: FormSelect }>()
  let busy = useBusy()

  return (
    <div className="max-w-2xl">
      {/* Publishing */}
      <RouterForm method="POST">
        <input type="hidden" name="verb" value="toggle_status" />
        <Fieldset title="Publishing">
          <Field
            label="Status"
            help="Control whether this form accepts live responses."
            size="sm"
          >
            <button
              type="submit"
              className="btn btn-outline btn-sm"
              disabled={busy}
            >
              {form.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </Field>
        </Fieldset>
      </RouterForm>

      <PublicLinkFieldset form={form} />

      {/* Danger zone */}
      <Fieldset title="Danger zone">
        <Field
          label="Delete"
          help="Delete this form and all associated responses."
          size="sm"
        >
          <DeleteButton
            openLabel="Delete Form"
            title="Delete Form"
            verb="delete_form"
            className="btn btn-outline btn-sm btn-error"
          >
            Are you sure you want to delete this form and all its data?
          </DeleteButton>
        </Field>
      </Fieldset>
    </div>
  )
}

function PublicLinkFieldset({ form }: { form: FormSelect }) {
  let path = `/f/${form.public_id}`

  if (form.status !== 'published') {
    return (
      <Fieldset title="Public link">
        <Field
          label="Share with respondents"
          help="The public link is only available after you publish this form. Use Publish in the section above."
          size="sm"
        >
          <p className="text-sm text-base-content/50">
            Publish the form to enable a copyable link. Draft responses are
            still available in{' '}
            <Link
              to={`/forms/${form.public_id}/preview`}
              className="link link-primary"
            >
              Preview
            </Link>
            .
          </p>
        </Field>
      </Fieldset>
    )
  }

  return (
    <Fieldset title="Public link">
      <Field
        label="Share with respondents"
        help="Anyone with this link can submit without signing in."
        size="sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="block max-w-full truncate rounded-lg bg-base-200 px-3 py-2 text-sm">
            {path}
          </code>
          <button
            type="button"
            className="btn shrink-0 gap-1.5 btn-outline btn-sm"
            onClick={() => {
              let url = `${window.location.origin}${path}`
              void navigator.clipboard.writeText(url)
              toast.success('Link copied')
            }}
          >
            <CopyIcon className="size-4" />
            Copy
          </button>
        </div>
      </Field>
    </Fieldset>
  )
}
