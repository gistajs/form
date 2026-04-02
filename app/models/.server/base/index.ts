import type { AnyColumn } from 'drizzle-orm'
import { asc, count, desc, eq } from 'drizzle-orm'
import { assert } from 'es-toolkit'
import { db } from '~/.server/db'
import { notFoundError } from '~/lib/.server/errors'
import { Lens } from '~/lib/data/lens'
import { buildWhere, getTableName } from './query'
import type {
  QueryConfigFirst,
  QueryConfigMany,
  QueryResult,
  Table,
  TableName,
  Where,
} from './types'

export function createModel<T extends Table>(table: T) {
  type Select = T['$inferSelect']
  type Insert = T['$inferInsert']
  type Update = Partial<Insert>
  type First = QueryConfigFirst<T>
  type Many = QueryConfigMany<T>
  type Row<C extends Many> = QueryResult<T, C>
  type FindFirst<C extends First> = Promise<Row<C> | undefined>
  type FindMany<C extends Many> = Promise<Row<C>[]>

  let key = getTableName(table) as T['_']['name'] & TableName
  let query = db.query[key]
  assert(query, `Model ${key} not found`)

  return {
    table,

    // Find first

    async findBy<const C extends First = First>(
      where?: Where<T>,
      options?: C,
    ): FindFirst<C> {
      let queryOptions = { ...options, where: buildWhere(table, where) }
      return await query.findFirst(queryOptions as any)
    },

    async findByID<const C extends First = First>(
      id: number | string,
      options?: C,
    ) {
      return await this.findByOrThrow({ id } as Where<T>, options)
    },

    async findByPublicID<const C extends First = First>(
      public_id: string,
      options?: C,
    ) {
      return await this.findByOrThrow({ public_id } as Where<T>, options)
    },

    async findByOrThrow<const C extends First = First>(
      where: Where<T>,
      options?: C,
    ) {
      let row = await this.findBy(where, options)
      if (!row) throw notFoundError()
      return row as Row<C>
    },

    // Find many

    async findAll<const C extends Many = Many>(options?: C): FindMany<C> {
      let queryOptions = {
        ...options,
        where: buildWhere(table, options?.where),
      }
      return (await query.findMany(queryOptions as any)) as Row<C>[]
    },

    async findAllBy<const C extends Many = Many>(where: Where<T>, options?: C) {
      return await this.findAll({ ...(options ?? {}), where } as C)
    },

    async orderBy<const C extends Many = Many>(
      column: string,
      direction: 'asc' | 'desc',
      options?: C,
    ) {
      let sortColumn = table[column] as AnyColumn
      assert(
        sortColumn,
        `${getTableName(table)}.${column} column does not exist`,
      )
      let sort = direction === 'asc' ? asc : desc
      let opts = { ...(options ?? {}), orderBy: [sort(sortColumn)] }
      return await this.findAll(opts as C)
    },

    async newest<const C extends Many = Many>(options?: C) {
      return await this.orderBy('id', 'desc', options)
    },

    async oldest<const C extends Many = Many>(options?: C) {
      return await this.orderBy('id', 'asc', options)
    },

    async newestBy<const C extends Many = Many>(column: string, options?: C) {
      return await this.orderBy(column, 'desc', options)
    },

    async oldestBy<const C extends Many = Many>(column: string, options?: C) {
      return await this.orderBy(column, 'asc', options)
    },

    // CRUD operations

    async create(data: Insert): Promise<Select> {
      let rows = await db.insert(table).values(data).returning()
      return rows[0] as Select
    },

    async createMany(data: Insert[]): Promise<Select[]> {
      let rows = await db.insert(table).values(data).returning()
      return rows as Select[]
    },

    async update(id: number, data: Update): Promise<Select> {
      let payload = { ...data } as Record<string, unknown>
      if ('updated_at' in table && !payload.updated_at) {
        payload.updated_at = new Date()
      }
      let rows = await db
        .update(table)
        .set(payload as any)
        .where(eq((table as any).id, id))
        .returning()
      return rows[0] as Select
    },

    async touch(id: number): Promise<Select> {
      return await this.update(id, {})
    },

    async delete(id: number): Promise<Select> {
      let rows = await db
        .delete(table)
        .where(eq((table as any).id, id))
        .returning()
      return rows[0] as Select
    },

    async updateJson(self: Record<string, any>, path: string, data: any) {
      let [column, ...rest] = path.split('.')
      let col = table[column]
      assert(col?.dataType === 'json', `${key}.${column} is not a jsonb column`)
      assert(rest.length, 'updateJson path must include a nested key')
      let target = self[column] ?? {}
      Lens.setOrMerge(target, rest.join('.'), data)
      return await this.update(self.id, { [column]: target } as Update)
    },

    async count(options?): Promise<number> {
      let rows = await db
        .select({ value: count() })
        .from(table)
        .where(buildWhere(table, options?.where))
      return rows[0].value
    },

    async findOrCreateBy(where: Where<T>, data?): Promise<Select> {
      let row = await this.findBy(where)
      if (row) return row as Select
      return await this.create({ ...where, ...data } as Insert)
    },

    async createOrUpdateBy(where: Where<T>, data?): Promise<Select> {
      let row = await this.findBy(where)
      if (row) {
        let existing = row as Select
        return data ? await this.update((existing as any).id, data) : existing
      }
      return await this.create({ ...where, ...data } as Insert)
    },
  }
}
