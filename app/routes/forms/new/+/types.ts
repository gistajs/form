import type { FormDraftScaffold } from '~/features/form/scaffold'
import type { Field } from '~/features/form/types'

export type ActionData = {
  errors?: {
    name?: string[]
  }
  formError?: string
}

export type UnsavedField = Field & {
  isNew?: boolean
}

export type UnsavedScaffold = Omit<FormDraftScaffold, 'fields'> & {
  fields: UnsavedField[]
}
