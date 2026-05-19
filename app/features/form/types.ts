import type {
  Field as SchemaField,
  FormConfig as SchemaFormConfig,
  FormKind as SchemaFormKind,
  FormSelect as SchemaFormSelect,
  SubmissionSelect as SchemaSubmissionSelect,
} from '~/.server/db/schema'

export type Field = SchemaField
export type FormKind = SchemaFormKind
export type FormConfig = SchemaFormConfig

export type FormSelect = Omit<SchemaFormSelect, 'created_at' | 'updated_at'> & {
  created_at: Date
  updated_at: Date
}

export type SubmissionSelect = Omit<SchemaSubmissionSelect, 'created_at'> & {
  created_at: Date
}

export type FormInsert = Omit<
  FormSelect,
  'id' | 'public_id' | 'created_at' | 'updated_at' | 'kind' | 'config'
> & {
  created_at?: Date | string
  updated_at?: Date | string
  public_id?: string
  kind?: FormSelect['kind']
  config?: FormSelect['config']
}

export type SubmissionInsert = Omit<
  SubmissionSelect,
  'id' | 'public_id' | 'created_at'
> & {
  created_at?: Date | string
  public_id?: string
}
