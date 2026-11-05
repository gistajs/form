import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from 'drizzle-orm'
import type { db } from '~/.server/db'

type FullSchema = typeof db._.fullSchema

export type TableName = keyof typeof db.query
export type Table = FullSchema[TableName]
export type Schema = ExtractTablesWithRelations<FullSchema>

type WhereOps<V> = {
  gt?: V
  gte?: V
  lt?: V
  lte?: V
  ne?: V
  not?: null
  in?: V[]
  '>'?: V
  '>='?: V
  '<'?: V
  '<='?: V
  '!='?: V
}

export type Where<T extends Table> = {
  [K in keyof T['$inferSelect']]?:
    | T['$inferSelect'][K]
    | WhereOps<T['$inferSelect'][K]>
    | null
}

type DrizzleQueryConfig<T extends Table> = DBQueryConfig<
  'many',
  true,
  Schema,
  Schema[T['_']['name']]
>

export type QueryConfigMany<T extends Table> = Omit<
  DrizzleQueryConfig<T>,
  'where'
> & {
  where?: Where<T>
}

export type QueryConfigFirst<T extends Table> = Omit<
  QueryConfigMany<T>,
  'limit'
>

export type QueryResult<
  T extends Table,
  C extends QueryConfigMany<T>,
> = BuildQueryResult<Schema, Schema[T['_']['name']], Omit<C, 'where'>>
