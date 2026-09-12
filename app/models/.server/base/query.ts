import {
  and,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
} from 'drizzle-orm'
import { assert } from 'es-toolkit'
import type { Table } from './types'

export function getTableName(table: Table) {
  return table[Symbol.for('drizzle:Name')]
}

export function buildWhere(model: any, where?: any) {
  if (!isObject(where)) return undefined

  let conditions = Object.entries(where)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => buildCondition(model, key, value))
    .filter(Boolean)

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]
  return and(...conditions)
}

function buildCondition(model: any, key: string, value: any) {
  let column = model[key]
  assert(column, `${getTableName(model)}.${key} column does not exist`)

  if (value === null) return isNull(column)
  if (!isObject(value)) return eq(column, value)

  let ops: any[] = []
  if (value.not === null) ops.push(isNotNull(column))
  let gtValue = value.gt ?? value['>']
  if (gtValue !== undefined) ops.push(gt(column, gtValue))

  let gteValue = value.gte ?? value['>=']
  if (gteValue !== undefined) ops.push(gte(column, gteValue))

  let ltValue = value.lt ?? value['<']
  if (ltValue !== undefined) ops.push(lt(column, ltValue))

  let lteValue = value.lte ?? value['<=']
  if (lteValue !== undefined) ops.push(lte(column, lteValue))

  let neValue = value.ne ?? value['!=']
  if (neValue !== undefined) ops.push(ne(column, neValue))
  if (value.in !== undefined) ops.push(inArray(column, value.in))

  if (ops.length === 0) return eq(column, value)
  if (ops.length === 1) return ops[0]
  return and(...ops)
}

function isObject(value: any): value is Record<string, any> {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  )
}
