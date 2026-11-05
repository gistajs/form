import {
  buildGridFieldJson,
  gridFieldMissingRequired,
  isGridField,
  submissionHasInvalidGridValue,
  type SubmissionField,
} from './grid'
import { submissionHasInvalidRadioValue } from './radio/utils'

export function buildSubmissionData(
  fields: SubmissionField[],
  payload: Record<string, unknown>,
): { ok: true; data: Record<string, string> } | { ok: false; error: string } {
  for (let field of fields) {
    if (isGridField(field)) {
      if (gridFieldMissingRequired(field, payload)) {
        return { ok: false, error: `${field.label} is required` }
      }
      continue
    }
    if (field.required && !payload[`field_${field.key}`]) {
      return { ok: false, error: `${field.label} is required` }
    }
  }

  let data: Record<string, string> = {}
  for (let field of fields) {
    if (isGridField(field)) {
      let built = buildGridFieldJson(field, payload)
      if (!built.ok) return { ok: false, error: built.error }
      data[field.key] = built.json
      continue
    }
    let val = payload[`field_${field.key}`]
    data[field.key] =
      field.type === 'checkbox'
        ? val == null
          ? 'false'
          : 'true'
        : val
          ? String(val)
          : ''
  }

  if (submissionHasInvalidRadioValue(fields, data)) {
    return { ok: false, error: 'Invalid response' }
  }
  if (submissionHasInvalidGridValue(fields, data)) {
    return { ok: false, error: 'Invalid response' }
  }

  return { ok: true, data }
}
