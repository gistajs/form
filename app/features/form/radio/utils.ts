export type RadioOption = { primary: string; secondary?: string }

export function radioOptionPrimaries(
  options: RadioOption[] | null | undefined,
) {
  if (!options?.length) return []
  return options.map((o) => o.primary)
}

export type RadioLayout = 'auto' | 'horizontal' | 'vertical'

export const DEFAULT_RADIO_LAYOUT: RadioLayout = 'auto'

export function normalizeRadioLayout(raw: unknown): RadioLayout {
  if (raw === 'horizontal' || raw === 'vertical' || raw === 'auto') return raw
  return 'auto'
}

export const DEFAULT_RADIO_OPTIONS: RadioOption[] = [
  { primary: 'Option A', secondary: 'First choice' },
  { primary: 'Option B', secondary: 'Second choice' },
  { primary: 'Option C' },
]

const RADIO_OPTIONS_NEED_PRIMARY =
  'Add at least one option with a primary label' as const

type RadioOptionsParseFail = {
  ok: false
  reason: 'not_array' | 'duplicate' | 'empty'
}

type RadioOptionsParseOk = { ok: true; options: RadioOption[] }

function parseRadioOptionsArray(
  raw: unknown,
): RadioOptionsParseOk | RadioOptionsParseFail {
  if (!Array.isArray(raw)) return { ok: false, reason: 'not_array' }
  let seen = new Set<string>()
  let out: RadioOption[] = []
  for (let item of raw) {
    if (typeof item === 'string') {
      let p = item.trim()
      if (!p) continue
      if (seen.has(p)) return { ok: false, reason: 'duplicate' }
      seen.add(p)
      out.push({ primary: p })
    } else if (item && typeof item === 'object') {
      let o = item as Record<string, unknown>
      let primary = String(o.primary ?? '').trim()
      if (!primary) continue
      if (seen.has(primary)) return { ok: false, reason: 'duplicate' }
      seen.add(primary)
      let secondary = String(o.secondary ?? '').trim()
      out.push(secondary ? { primary, secondary } : { primary })
    }
  }
  return out.length
    ? { ok: true, options: out }
    : { ok: false, reason: 'empty' }
}

export function getRadioOptionsError(raw: unknown) {
  let r = parseRadioOptionsArray(raw)
  if (r.ok) return null
  if (r.reason === 'duplicate') return 'Radio option labels must be unique'
  return RADIO_OPTIONS_NEED_PRIMARY
}

export function normalizeRadioOptions(raw: unknown): RadioOption[] | null {
  let r = parseRadioOptionsArray(raw)
  return r.ok ? r.options : null
}

export function isRichRadioLayout(opts: RadioOption[]) {
  if (opts.length <= 3) return true
  return opts.some((o) => String(o.secondary || '').trim().length > 0)
}

export function resolveRadioOrientation(
  field: { radio_layout?: RadioLayout | null },
  opts: RadioOption[],
): 'horizontal' | 'vertical' {
  let mode = field.radio_layout ?? DEFAULT_RADIO_LAYOUT
  if (mode === 'horizontal') return 'horizontal'
  if (mode === 'vertical') return 'vertical'
  return isRichRadioLayout(opts) ? 'vertical' : 'horizontal'
}

export function radioOptionsFromField(field: {
  type: string
  options?: string[] | RadioOption[] | null
}): RadioOption[] {
  if (field.type !== 'radio' || !field.options) return []
  return field.options as RadioOption[]
}

export function isInvalidRadioValue(
  field: { type: string; options?: string[] | RadioOption[] | null },
  submitted: string,
) {
  if (field.type !== 'radio' || !field.options) return false
  if (!submitted) return false
  let allowed = new Set(radioOptionPrimaries(radioOptionsFromField(field)))
  return !allowed.has(submitted)
}

export function submissionHasInvalidRadioValue(
  fields: Array<{
    key: string
    type: string
    options?: string[] | RadioOption[] | null
  }>,
  data: Record<string, string>,
) {
  for (let field of fields) {
    if (isInvalidRadioValue(field, data[field.key])) return true
  }
  return false
}
