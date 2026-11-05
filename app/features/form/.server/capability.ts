import { notFoundError } from '~/lib/.server/errors'
import { Form } from '~/models/.server/form'
import type { FormSelect } from '../types'

export function assertPublished(form: FormSelect) {
  if (form.status !== 'published') throw notFoundError()
}

export async function resolveForm(publicId: string | undefined) {
  let normalized =
    typeof publicId === 'string' ? publicId.trim().toLowerCase() : ''
  if (!normalized) throw notFoundError()

  let form = await Form.findPublicBy({ public_id: normalized } as any)
  if (!form) throw notFoundError()

  return { userId: form.user_id, form }
}
