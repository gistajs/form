import { hexid } from '~/lib/data/hexid'
import { availabilityPollDayjs } from './availability-poll/dayjs'
import {
  isUsableAvailabilityTimeZone,
  normalizeAvailabilityPollConfig,
} from './availability-poll/time'
import { FIELD_TYPES, FORM_TEMPLATES, type FormTemplateId } from './fields'
import type { FormConfig, FormKind } from './form-types'
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  normalizeGridLabels,
} from './grid'
import {
  normalizeRadioLayout,
  normalizeRadioOptions,
  type RadioOption,
} from './radio/utils'
import type { Field, FormSelect } from './types'

export type FormScaffold = {
  name: string
  description: string
  fields: Field[]
  kind: FormKind
  config: FormConfig
}

export type FormDraftScaffold = FormScaffold & {
  /** Suggested title when starting from a template; UI-only, not persisted. */
  namePlaceholder?: string
  /** Suggested description when starting from a template; UI-only, not persisted. */
  descriptionPlaceholder?: string
}

type FormScaffoldOptions = {
  presetId?: string
  availabilityPollStartAt?: string
  availabilityPollTimeZone?: string
}

export function buildFormScaffold(options: FormScaffoldOptions = {}) {
  let preset = options.presetId
    ? FORM_TEMPLATES[options.presetId as FormTemplateId]
    : null

  return {
    name: '',
    description: '',
    ...(preset
      ? {
          namePlaceholder: preset.name,
          descriptionPlaceholder: preset.description,
        }
      : {}),
    fields: cloneFields(preset?.fields || []),
    kind: options.presetId === 'availability_poll' ? 'availability_poll' : null,
    config:
      options.presetId === 'availability_poll'
        ? buildAvailabilityPollScaffold(
            options.availabilityPollStartAt,
            options.availabilityPollTimeZone,
          )
        : null,
  } satisfies FormDraftScaffold
}

export function parseFormScaffold(raw: string) {
  let value = parseJson(raw)
  return normalizeFormScaffold(value)
}

export function toPreviewForm(scaffold: FormScaffold): FormSelect {
  let now = new Date()

  return {
    id: 0,
    public_id: '',
    user_id: 0,
    name: scaffold.name.trim() || 'Untitled Form',
    description: scaffold.description.trim() || null,
    status: 'draft',
    fields: scaffold.fields,
    kind: scaffold.kind,
    config: scaffold.config,
    created_at: now,
    updated_at: now,
  }
}

function cloneFields(fields: Array<Omit<Field, 'key'>>) {
  return fields.map((field) => ({
    key: hexid(8),
    label: field.label,
    type: field.type,
    required: field.required,
    options: cloneFieldOptions(field),
    ...(field.type === 'radio'
      ? { radio_layout: normalizeRadioLayout(field.radio_layout) }
      : {}),
    ...(field.type === 'grid_radio' || field.type === 'grid_checkbox'
      ? cloneGridAxes(field)
      : {}),
  }))
}

function cloneGridAxes(field: Omit<Field, 'key'>) {
  let rows = field.rows
  let cols = field.columns
  return {
    rows: rows?.length ? [...rows] : [...DEFAULT_GRID_ROWS],
    columns: cols?.length ? [...cols] : [...DEFAULT_GRID_COLUMNS],
  }
}

function cloneFieldOptions(field: Omit<Field, 'key'>): Field['options'] {
  if (!field.options) return null
  if (field.type === 'select') {
    return [...(field.options as string[])]
  }
  if (field.type === 'radio') {
    return (field.options as RadioOption[]).map((o) =>
      o.secondary
        ? { primary: o.primary, secondary: o.secondary }
        : { primary: o.primary },
    )
  }
  return null
}

function buildAvailabilityPollScaffold(
  startAtRaw?: string,
  timeZoneRaw?: string,
): FormConfig {
  let time_zone = String(timeZoneRaw || '').trim()
  if (!time_zone || !isUsableAvailabilityTimeZone(time_zone)) return null

  let anchor =
    startAtRaw && availabilityPollDayjs.utc(startAtRaw).isValid()
      ? availabilityPollDayjs.utc(startAtRaw).tz(time_zone)
      : availabilityPollDayjs()
          .tz(time_zone)
          .add(1, 'day')
          .hour(9)
          .minute(0)
          .second(0)
          .millisecond(0)

  let second = anchor.add(1, 'day')
  let candidate_lines = [
    `${anchor.format('YYYY-MM-DD')} (${anchor.format('ddd')}) 09:00–10:00`,
    `${second.format('YYYY-MM-DD')} (${second.format('ddd')}) 14:00–16:00`,
  ].join('\n')

  return normalizeAvailabilityPollConfig({
    time_zone,
    candidate_lines,
    readonly_responses: false,
  })
}

function normalizeFormScaffold(value: any): FormScaffold | null {
  if (!value || typeof value !== 'object') return null

  let fields = Array.isArray(value.fields)
    ? value.fields.map(normalizeField).filter(Boolean)
    : []
  let config = normalizeAvailabilityPollConfig(value.config)
  let kind: FormKind =
    value.kind === 'availability_poll' ? 'availability_poll' : null

  return {
    name: String(value.name || '').trim(),
    description: String(value.description || '').trim(),
    fields,
    kind,
    config,
  }
}

function normalizeField(field: any): Field | null {
  if (!field || typeof field !== 'object') return null
  if (typeof field.label !== 'string' || !field.label.trim()) return null
  if (!FIELD_TYPES.includes(field.type)) return null

  if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
    let rows = normalizeGridLabels(field.rows)
    let cols = normalizeGridLabels(field.columns)
    if (!rows || !cols) return null
    return {
      key:
        typeof field.key === 'string' && field.key.trim()
          ? field.key
          : hexid(8),
      label: field.label.trim(),
      type: field.type,
      required: Boolean(field.required),
      options: null,
      rows,
      columns: cols,
    } satisfies Field
  }

  let options: Field['options'] = null
  if (field.type === 'select' && Array.isArray(field.options)) {
    options = field.options
      .map((option: any) => String(option || '').trim())
      .filter(Boolean)
  } else if (field.type === 'radio' && Array.isArray(field.options)) {
    options = normalizeRadioOptions(field.options)
    if (!options) return null
  }

  return {
    key:
      typeof field.key === 'string' && field.key.trim() ? field.key : hexid(8),
    label: field.label.trim(),
    type: field.type,
    required: Boolean(field.required),
    options,
    ...(field.type === 'radio'
      ? { radio_layout: normalizeRadioLayout(field.radio_layout) }
      : {}),
  } satisfies Field
}

function parseJson(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
