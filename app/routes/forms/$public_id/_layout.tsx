import { LinkIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher, Outlet, useLoaderData, useLocation } from 'react-router'
import { dataWithSuccess } from 'remix-toast'
import { toast } from 'sonner'
import { z } from 'zod'
import { requireUser } from '~/.server/auth/middlewares'
import { cn } from '~/lib/cn'
import { payloadFromRequest } from '~/lib/data/payload'
import { validate } from '~/lib/data/validate'
import { Form } from '~/models/.server/form'
import { InputError } from '~/ui/forms/input-error'
import { NavTabs } from '~/ui/tabs'

const updateFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
})

export async function loader({ params, context }) {
  let user = requireUser(context)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })

  return { form }
}

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })

  if (payload.verb !== 'update_form') return null

  let { data, errors } = validate(payload, updateFormSchema)
  if (errors) return { errors }

  await Form.update(user.id, form.id, {
    name: data.name,
    description: data.description || null,
  })

  return dataWithSuccess({ ok: true }, 'Form updated')
}

export default function Layout() {
  let { form } = useLoaderData<typeof loader>()
  let location = useLocation()
  let isPreview = location.pathname.endsWith('/preview')
  let fetcher = useFetcher()
  let busy = fetcher.state !== 'idle'
  let [editing, setEditing] = useState(false)
  let formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      {isPreview || (
        <div className="sticky top-16 z-20 -mx-6 mb-6 bg-base-100/45 px-6 pt-3 backdrop-blur-lg sm:-mx-8">
          <div className="pb-1">
            <fetcher.Form
              key={`${form.name}:${form.description || ''}`}
              ref={formRef}
              method="POST"
              action={`/forms/${form.public_id}`}
              className="pb-1"
              onFocus={() => setEditing(true)}
              onBlur={(event) => {
                let next = event.relatedTarget
                if (next instanceof Node && formRef.current?.contains(next))
                  return
                setEditing(false)
              }}
            >
              <input type="hidden" name="verb" value="update_form" />

              <div className="min-w-0 flex-1">
                <div className="inline-flex max-w-full flex-wrap items-center gap-4">
                  <AutoInput
                    type="text"
                    name="name"
                    defaultValue={form.name}
                    placeholder="Untitled Form"
                    className="text-2xl font-bold tracking-tight"
                  />
                  <StatusBadge status={form.status} />
                  {form.status === 'published' && (
                    <PublicLink publicId={form.public_id} />
                  )}
                </div>
                <InputError name="name" fetcher={fetcher} />

                <AutoTextarea
                  name="description"
                  defaultValue={form.description || ''}
                  placeholder="Add a short description"
                  className="mt-1 w-full max-w-2xl px-0 py-0 text-sm leading-6 text-base-content/60"
                />
                <InputError name="description" fetcher={fetcher} />

                <div
                  className={cn(
                    'mt-3 transition-opacity',
                    editing
                      ? 'pointer-events-auto opacity-100'
                      : 'pointer-events-none h-0 overflow-hidden opacity-0',
                  )}
                >
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary"
                    disabled={busy}
                    onClick={() => setEditing(false)}
                  >
                    {busy ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </fetcher.Form>
          </div>
          <NavTabs tabs={getTabs(form.public_id)} />
        </div>
      )}

      <Outlet context={{ form }} />
    </>
  )
}

function getTabs(formId: string) {
  return [
    {
      name: 'Questions',
      href: `/forms/${formId}`,
      end: true,
    },
    {
      name: 'Responses',
      href: `/forms/${formId}/submissions`,
    },
    {
      name: 'Settings',
      href: `/forms/${formId}/settings`,
    },
  ]
}

function StatusBadge({ status }: { status: string }) {
  let cls = status === 'published' ? 'badge-success' : 'badge-ghost'
  return <span className={cn('badge badge-soft badge-sm', cls)}>{status}</span>
}

function PublicLink({ publicId }: { publicId: string }) {
  let path = `/f/${publicId}`
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 text-xs text-base-content/40 transition-colors hover:text-base-content/70"
      onMouseDown={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        let url = `${window.location.origin}${path}`
        void navigator.clipboard.writeText(url)
        toast.success('Public link copied')
      }}
    >
      <LinkIcon className="size-3" />
      <span>{path}</span>
    </button>
  )
}

function AutoInput({
  defaultValue = '',
  className = '',
  onInput,
  onKeyDown,
  placeholder = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  let inputRef = useRef<HTMLInputElement>(null)
  let sizerRef = useRef<HTMLSpanElement>(null)

  let resize = () => {
    let input = inputRef.current
    let sizer = sizerRef.current
    if (!input || !sizer) return

    let value = input.value || String(placeholder) || ' '
    sizer.textContent = value
    input.style.width = `${Math.ceil(sizer.getBoundingClientRect().width) + 2}px`
  }

  useEffect(() => {
    resize()
  }, [defaultValue, placeholder])

  return (
    <span className="relative inline-block max-w-full">
      <input
        {...props}
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          'input h-auto max-w-xl min-w-0 border-0 input-ghost px-0 shadow-none outline-none focus:ring-0 focus:outline-none focus-visible:outline-none',
          className,
        )}
        onInput={(event) => {
          resize()
          onInput?.(event)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
            event.currentTarget.blur()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            event.currentTarget.blur()
          }
          onKeyDown?.(event)
        }}
      />
      <span
        ref={sizerRef}
        aria-hidden
        className={cn(
          'invisible absolute top-0 left-0 h-0 overflow-hidden px-0 whitespace-pre',
          className,
        )}
      />
    </span>
  )
}

function AutoTextarea({
  defaultValue = '',
  className = '',
  onKeyDown,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={1}
      defaultValue={defaultValue}
      className={cn(
        'block field-sizing-content h-auto min-h-0 resize-none overflow-hidden border-0 bg-transparent shadow-none outline-none',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.currentTarget.blur()
        }
        onKeyDown?.(event)
      }}
    />
  )
}
