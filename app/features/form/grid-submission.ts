export type ParsedGridSubmission =
  | { ok: true; variant: 'radio'; byRow: Map<number, number> }
  | { ok: true; variant: 'checkbox'; byRow: Map<number, number[]> }
  | { ok: false; display: string }

function isPlainPayloadObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function parseStoredGridSubmission(
  field: { type: string; rows?: string[] | null; columns?: string[] | null },
  raw: string,
): ParsedGridSubmission {
  if (field.type !== 'grid_radio' && field.type !== 'grid_checkbox') {
    return { ok: false, display: raw }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, display: raw }
  }
  if (!isPlainPayloadObject(parsed)) {
    return { ok: false, display: raw }
  }
  if (field.type === 'grid_radio') {
    let byRow = new Map<number, number>()
    for (let rk of Object.keys(parsed).sort((a, b) => Number(a) - Number(b))) {
      if (!/^\d+$/.test(rk)) continue
      let ri = Number(rk)
      if (!Number.isInteger(ri) || ri < 0) continue
      let col = String(parsed[rk]).trim()
      if (!/^\d+$/.test(col)) return { ok: false, display: raw }
      let ci = Number(col)
      if (!Number.isInteger(ci) || ci < 0) continue
      byRow.set(ri, ci)
    }
    return { ok: true, variant: 'radio', byRow }
  }
  let byRow = new Map<number, number[]>()
  for (let rk of Object.keys(parsed).sort((a, b) => Number(a) - Number(b))) {
    if (!/^\d+$/.test(rk)) continue
    let ri = Number(rk)
    if (!Number.isInteger(ri) || ri < 0) continue
    let val = parsed[rk]
    if (!Array.isArray(val)) continue
    let cols: number[] = []
    let seen = new Set<number>()
    for (let item of val) {
      let col = String(item).trim()
      if (!/^\d+$/.test(col)) return { ok: false, display: raw }
      let ci = Number(col)
      if (!Number.isInteger(ci) || ci < 0) continue
      if (seen.has(ci)) continue
      seen.add(ci)
      cols.push(ci)
    }
    cols.sort((a, b) => a - b)
    if (cols.length) byRow.set(ri, cols)
  }
  return { ok: true, variant: 'checkbox', byRow }
}

export function hasGridDrift(
  parsed: ParsedGridSubmission,
  rowCount: number,
  colCount: number,
) {
  if (!parsed.ok) return false
  if (parsed.variant === 'radio') {
    for (let [ri, ci] of parsed.byRow.entries()) {
      if (ri >= rowCount || ci >= colCount) return true
    }
    return false
  }
  for (let [ri, values] of parsed.byRow.entries()) {
    if (ri >= rowCount) return true
    if (values.some((ci) => ci >= colCount)) return true
  }
  return false
}

export function formatLegacyGridSubmission(
  field: { rows?: string[] | null; columns?: string[] | null },
  parsed: Extract<ParsedGridSubmission, { ok: true }>,
) {
  let rows = field.rows || []
  let cols = field.columns || []
  let parts: string[] = []

  if (parsed.variant === 'radio') {
    for (let [ri, ci] of parsed.byRow.entries()) {
      let rowLabel = rows[ri] ?? `Row ${ri}`
      let colLabel = cols[ci] ?? String(ci)
      parts.push(`${rowLabel}: ${colLabel}`)
    }
    return parts.length ? parts.join('; ') : '—'
  }

  for (let [ri, values] of parsed.byRow.entries()) {
    let rowLabel = rows[ri] ?? `Row ${ri}`
    let labels = values.map((ci) => cols[ci] ?? String(ci)).join(', ')
    parts.push(`${rowLabel}: ${labels}`)
  }

  return parts.length ? parts.join('; ') : '—'
}
