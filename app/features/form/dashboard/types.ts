import type { Field, FormConfig, FormKind } from '~/features/form/types'

export type DashboardForm = {
  public_id: string
  name: string
  description: string | null
  status: string
  fields: Field[]
  kind: FormKind
  config: FormConfig
  fields_summary: string
  submission_count: number
  updated_at: any
  created_at: any
}
