import type { RadioOption } from './radio/utils'

export const GRID_ROW_PARAM_PREFIX = 'row_' as const

export const DEFAULT_GRID_ROWS = ['Statement A', 'Statement B'] as const
export const DEFAULT_GRID_COLUMNS = ['Poor', 'Fair', 'Good'] as const

export function isGridField(field: { type: string }) {
  return field.type === 'grid_radio' || field.type === 'grid_checkbox'
}

export function normalizeGridLabels(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  let seen = new Set<string>()
  let out: string[] = []
  for (let item of raw) {
    let s = String(item ?? '').trim()
    if (!s) continue
    if (seen.has(s)) return null
    seen.add(s)
    out.push(s)
  }
  return out.length ? out : null
}

export function getGridLabelsError(raw: unknown) {
  if (!Array.isArray(raw)) return 'Labels must be a JSON array'
  let seen = new Set<string>()
  let any = false
  for (let item of raw) {
    let s = String(item ?? '').trim()
    if (!s) continue
    any = true
    if (seen.has(s)) return 'Labels must be unique'
    seen.add(s)
  }
  return any ? null : 'Add at least one non-empty label'
}

function isPlainPayloadObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function normalizeCheckboxRowPayload(v: unknown): string[] {
  if (v === undefined || v === null) return []
  if (Array.isArray(v)) return v.map((x) => String(x))
  return [String(v)]
}

export type SubmissionField = {
  key: string
  type: string
  label?: string
  required?: boolean
  options?: string[] | RadioOption[] | null
  rows?: string[] | null
  columns?: string[] | null
}

export function gridFieldMissingRequired(
  field: SubmissionField,
  payload: Record<string, unknown>,
): boolean {
  if (!field.required) return false
  if (!isGridField(field)) return false
  let nR = field.rows?.length ?? 0
  if (nR === 0) return false
  let key = `field_${field.key}`
  let raw = payload[key]
  if (!isPlainPayloadObject(raw)) return true
  if (field.type === 'grid_radio') {
    for (let i = 0; i < nR; i++) {
      let v = raw[`${GRID_ROW_PARAM_PREFIX}${i}`]
      if (v === undefined || v === null || v === '') return true
    }
    return false
  }
  for (let i = 0; i < nR; i++) {
    let v = raw[`${GRID_ROW_PARAM_PREFIX}${i}`]
    let arr = normalizeCheckboxRowPayload(v)
    if (arr.length === 0) return true
  }
  return false
}

export function buildGridFieldJson(
  field: SubmissionField,
  payload: Record<string, unknown>,
): { ok: true; json: string } | { ok: false; error: string } {
  if (!isGridField(field)) {
    return { ok: false, error: 'Invalid field' }
  }
  let nR = field.rows?.length ?? 0
  let nC = field.columns?.length ?? 0
  if (nR < 1 || nC < 1) return { ok: false, error: 'Invalid response' }
  let key = `field_${field.key}`
  let raw = payload[key]
  if (!isPlainPayloadObject(raw)) {
    return { ok: true, json: '{}' }
  }
  if (field.type === 'grid_radio') {
    let out: Record<string, string> = {}
    for (let i = 0; i < nR; i++) {
      let v = raw[`${GRID_ROW_PARAM_PREFIX}${i}`]
      if (v === undefined || v === null || v === '') continue
      let col = String(v).trim()
      if (!/^\d+$/.test(col)) return { ok: false, error: 'Invalid response' }
      let ci = Number(col)
      if (!Number.isInteger(ci) || ci < 0 || ci >= nC) {
        return { ok: false, error: 'Invalid response' }
      }
      out[String(i)] = String(ci)
    }
    return { ok: true, json: JSON.stringify(out) }
  }
  let out: Record<string, string[]> = {}
  for (let i = 0; i < nR; i++) {
    let v = raw[`${GRID_ROW_PARAM_PREFIX}${i}`]
    let arr = normalizeCheckboxRowPayload(v)
    let seen = new Set<string>()
    let cols: string[] = []
    for (let c of arr) {
      let col = String(c).trim()
      if (!/^\d+$/.test(col)) return { ok: false, error: 'Invalid response' }
      let ci = Number(col)
      if (!Number.isInteger(ci) || ci < 0 || ci >= nC) {
        return { ok: false, error: 'Invalid response' }
      }
      let cs = String(ci)
      if (!seen.has(cs)) {
        seen.add(cs)
        cols.push(cs)
      }
    }
    cols.sort((a, b) => Number(a) - Number(b))
    if (cols.length) out[String(i)] = cols
  }
  return { ok: true, json: JSON.stringify(out) }
}

export function submissionHasInvalidGridValue(
  fields: SubmissionField[],
  data: Record<string, string>,
): boolean {
  for (let field of fields) {
    if (!isGridField(field)) continue
    let raw = data[field.key]
    if (!raw) continue
    let nR = field.rows?.length ?? 0
    let nC = field.columns?.length ?? 0
    if (nR < 1 || nC < 1) return true
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return true
    }
    if (!isPlainPayloadObject(parsed)) return true
    for (let rk of Object.keys(parsed)) {
      if (!/^\d+$/.test(rk)) return true
      let ri = Number(rk)
      if (!Number.isInteger(ri) || ri < 0 || ri >= nR) return true
    }
    if (field.type === 'grid_radio') {
      for (let rk of Object.keys(parsed)) {
        let col = String(parsed[rk]).trim()
        if (!/^\d+$/.test(col)) return true
        let ci = Number(col)
        if (!Number.isInteger(ci) || ci < 0 || ci >= nC) return true
      }
    } else {
      for (let rk of Object.keys(parsed)) {
        let val = parsed[rk]
        if (!Array.isArray(val)) return true
        let seen = new Set<string>()
        for (let item of val) {
          let col = String(item).trim()
          if (!/^\d+$/.test(col)) return true
          let ci = Number(col)
          if (!Number.isInteger(ci) || ci < 0 || ci >= nC) return true
          if (seen.has(col)) return true
          seen.add(col)
        }
      }
    }
  }
  return false
}
