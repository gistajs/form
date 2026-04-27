import { type ZodError, type ZodType, z } from 'zod'
import { type ZodMiniType } from 'zod/mini'
import { payloadFromForm } from '~/lib/data/payload'

type Schema = ZodType<any, any, any> | ZodMiniType<any, any, any>
type SchemaOutput<S extends Schema> = S extends { _zod: { output: infer O } }
  ? O
  : unknown

export type ValidationErrors = Record<string, string[]>

type TreeifiedError = {
  errors?: string[]
  properties?: {
    [key: string]: TreeifiedError
  }
  items?: TreeifiedError[]
}

type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ZodError }

type ValidationResult<S extends Schema> =
  | { ok: true; data: SchemaOutput<S>; errors: undefined }
  | { ok: false; data: never; errors: ValidationErrors }

export function validate<S extends Schema>(
  input: any,
  schema: S,
  logging?: 'debug' | 'info' | 'error',
): ValidationResult<S> {
  let payload = input instanceof FormData ? payloadFromForm(input) : input
  let result = schema.safeParse(payload) as SafeParseResult<SchemaOutput<S>>
  let { success, data, error } = result
  let errors = error && flattenErrors(z.treeifyError(error) as TreeifiedError)

  // logging
  if (logging) {
    if (logging === 'debug') {
      console.log('payload:', payload)
    }
    if (logging === 'error') {
      errors && console.log('errors:', errors)
    } else {
      // 'info' | 'error'
      console.log('data:', data)
      console.log('errors:', errors)
    }
  }

  if (success) {
    return { ok: true, data: data as SchemaOutput<S>, errors: undefined }
  }
  return { ok: false, data: undefined as never, errors: errors ?? {} }
}

function flattenErrors(treeErrors: TreeifiedError, prefix = '') {
  let flatErrors: Record<string, string[]> = {}

  // Handle top-level errors
  if (treeErrors.errors && treeErrors.errors.length > 0) {
    if (prefix) {
      flatErrors[prefix] = treeErrors.errors
    }
  }

  // Handle nested properties
  if (treeErrors.properties) {
    for (const [key, v] of Object.entries(treeErrors.properties)) {
      let newPrefix = prefix ? `${prefix}.${key}` : key
      let value = v as TreeifiedError
      if (value.errors && value.errors.length > 0) {
        flatErrors[newPrefix] = value.errors
      }
      // Recursively handle deeper nesting
      if (value.properties || value.items) {
        let nested = flattenErrors(value, newPrefix)
        Object.assign(flatErrors, nested)
      }
    }
  }

  // Handle array items
  if (treeErrors.items) {
    treeErrors.items.forEach((item: TreeifiedError, index: number) => {
      if (item) {
        let newPrefix = prefix ? `${prefix}.${index}` : `${index}`
        let nested = flattenErrors(item, newPrefix)
        Object.assign(flatErrors, nested)
      }
    })
  }

  return flatErrors
}
