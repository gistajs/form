import { sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { FieldType } from '~/features/form/fields'
import type { FormConfig, FormKind } from '~/features/form/form-types'
import type { RadioLayout, RadioOption } from '~/features/form/radio/utils'
import { defaultHex, defaultNow, foreign, id, idx } from './helpers'
import { users } from './schema/users'

export { users }
export type { Insert, Select, Update, UserBag } from './schema/users'
export type { RadioLayout, RadioOption }

export type Field = {
  key: string
  label: string
  type: FieldType
  required: boolean
  options?: string[] | RadioOption[] | null
  radio_layout?: RadioLayout | null
  rows?: string[] | null
  columns?: string[] | null
}

export type { FormConfig, FormKind }

export const forms = sqliteTable(
  'forms',
  {
    id: id(),
    public_id: defaultHex(),
    user_id: foreign(() => users).notNull(),
    name: text().notNull(),
    description: text(),
    fields: text({ mode: 'json' })
      .$type<Field[]>()
      .notNull()
      .default(sql`'[]'`),
    kind: text({ enum: ['availability_poll'] }).$type<FormKind>(),
    config: text({ mode: 'json' }).$type<FormConfig>(),
    status: text({ enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    created_at: defaultNow(),
    updated_at: defaultNow(),
  },
  (t) => [idx(t, 'user_id'), idx(t, 'status')],
)

export const submissions = sqliteTable(
  'submissions',
  {
    id: id(),
    public_id: defaultHex(),
    form_id: foreign(() => forms).notNull(),
    data: text({ mode: 'json' }).$type<Record<string, string>>(),
    created_at: defaultNow(),
  },
  (t) => [idx(t, 'form_id'), idx(t, 'created_at')],
)

export type FormSelect = typeof forms.$inferSelect
export type FormInsert = typeof forms.$inferInsert
export type SubmissionSelect = typeof submissions.$inferSelect
export type SubmissionInsert = typeof submissions.$inferInsert
