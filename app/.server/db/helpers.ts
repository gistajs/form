import { sql } from 'drizzle-orm'
import {
  customType,
  index,
  integer,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
  type IndexColumn,
  type UpdateDeleteAction,
} from 'drizzle-orm/sqlite-core'
import { hexid } from '~/lib/data/hexid'

// Custom Types
export const timestamp = customType<{ data: Date; driverData: string }>({
  dataType: (): string => 'text',
  toDriver: (value: Date): string =>
    value.toISOString().replace('T', ' ').replace('Z', ''),
  fromDriver: (value: string): Date => new Date(`${value.replace(' ', 'T')}Z`),
})

// Common Columns

export function id() {
  return integer().primaryKey({ autoIncrement: true })
}

export function defaultHex(length = 12) {
  return text()
    .unique()
    .notNull()
    .$defaultFn(() => hexid(length))
}

export function defaultNow() {
  return timestamp()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
}

// Indices

type Table = Record<string, AnySQLiteColumn>

export function idx(table: Table, ...names: string[]) {
  return buildIndex(index, table, ...names)
}

export function unq(table: Table, ...names: string[]) {
  return buildIndex(uniqueIndex, table, ...names)
}

function buildIndex(
  indexFn: typeof index | typeof uniqueIndex,
  table: Table,
  ...names: string[]
) {
  let columns = names.map((name) => table[name])
  let tableName = columns[0]?.table[Symbol.for('drizzle:Name')]
  let indexName = `${tableName}_${names.join('_')}_index`
  return indexFn(indexName).on(...(columns as [IndexColumn, ...IndexColumn[]]))
}

// Foreign Keys

type Cascade = { onDelete?: UpdateDeleteAction; onUpdate?: UpdateDeleteAction }
type TableWithId = { id: AnySQLiteColumn }

export function foreign<T extends TableWithId>(
  tableRef: () => T,
  { onDelete = 'cascade', onUpdate = 'no action' }: Cascade = {},
) {
  return integer().references(() => tableRef().id, { onDelete, onUpdate })
}
