import { dataWithError, dataWithSuccess } from 'remix-toast'
import { requireUser } from '~/.server/auth/middlewares'
import {
  AVAILABILITY_POLL_MAX_CANDIDATE_LINES,
  countNonEmptyCandidateLines,
  sortCandidateLinesByStartTime,
} from '~/features/form/availability-poll/parse-candidates'
import { buildAvailabilityPollSlots } from '~/features/form/availability-poll/slots'
import {
  isUsableAvailabilityTimeZone,
  normalizeAvailabilityPollConfig,
} from '~/features/form/availability-poll/time'
import { FIELD_TYPES, type FieldType } from '~/features/form/fields'
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  getGridLabelsError,
  normalizeGridLabels,
} from '~/features/form/grid'
import {
  DEFAULT_RADIO_OPTIONS,
  getRadioOptionsError,
  normalizeRadioLayout,
  normalizeRadioOptions,
} from '~/features/form/radio/utils'
import type { Field } from '~/features/form/types'
import { hexid } from '~/lib/data/hexid'
import { payloadFromRequest } from '~/lib/data/payload'
import { Form } from '~/models/.server/form'

function parseRadioOptionsFromPayload(raw: unknown) {
  let s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return { provided: false as const, options: null, error: null }
  try {
    let parsed = JSON.parse(s)
    let options = normalizeRadioOptions(parsed)
    if (options) {
      return { provided: true as const, options, error: null }
    }
    return {
      provided: true as const,
      options: null,
      error: getRadioOptionsError(parsed) || 'Radio options are invalid',
    }
  } catch {
    return {
      provided: true as const,
      options: null,
      error: 'Radio options are invalid',
    }
  }
}

function parseGridLabelsFromPayload(raw: unknown) {
  let s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) {
    return {
      provided: false as const,
      labels: null as string[] | null,
      error: null as string | null,
    }
  }
  try {
    let parsed = JSON.parse(s)
    let labels = normalizeGridLabels(parsed)
    if (labels) {
      return { provided: true as const, labels, error: null }
    }
    return {
      provided: true as const,
      labels: null,
      error: getGridLabelsError(parsed) || 'Labels are invalid',
    }
  } catch {
    return {
      provided: true as const,
      labels: null,
      error: 'Labels are invalid',
    }
  }
}

export async function action({ request, params, context }) {
  let user = requireUser(context)
  let payload = await payloadFromRequest(request)
  let form = await Form.findByOrThrow(user.id, {
    public_id: params.public_id,
  })
  let formFields = form.fields || []

  switch (payload.verb) {
    case 'update_availability_poll': {
      if (form.kind !== 'availability_poll' || !form.config) {
        return dataWithError(null, 'This form is not an availability poll.')
      }
      let tz = String(payload.availability_poll_time_zone || '').trim()
      let candidate_lines = sortCandidateLinesByStartTime(
        String(payload.candidate_lines ?? ''),
        tz,
      )
      if (!isUsableAvailabilityTimeZone(tz)) {
        return dataWithError(null, 'Unsupported or invalid time zone.')
      }
      let n = countNonEmptyCandidateLines(candidate_lines)
      if (n > AVAILABILITY_POLL_MAX_CANDIDATE_LINES) {
        return dataWithError(
          null,
          `At most ${AVAILABILITY_POLL_MAX_CANDIDATE_LINES} non-empty lines allowed.`,
        )
      }
      let readonly =
        payload.availability_poll_readonly_responses === 'on' ||
        payload.availability_poll_readonly_responses === '1' ||
        payload.availability_poll_readonly_responses === true
      let config = normalizeAvailabilityPollConfig({
        time_zone: tz,
        candidate_lines,
        readonly_responses: readonly,
      })
      if (!config || buildAvailabilityPollSlots(config).length < 1) {
        return dataWithError(
          null,
          'Add at least one non-empty line so there is something to vote on.',
        )
      }
      await Form.update(user.id, form.id, {
        config,
      })
      return dataWithSuccess({ ok: true }, 'Schedule updated')
    }
    case 'add_field': {
      let type = FIELD_TYPES.includes(payload.type as any)
        ? (payload.type as FieldType)
        : 'text'
      let options: Field['options'] = null
      if (type === 'select') {
        options = payload.options
          ? String(payload.options)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : ['Option 1', 'Option 2', 'Option 3']
      } else if (type === 'radio') {
        let parsedRadio = parseRadioOptionsFromPayload(payload.options)
        if (parsedRadio.provided) {
          if (parsedRadio.error) {
            return { errors: { options: [parsedRadio.error] } }
          }
          options = parsedRadio.options
        } else {
          options = [...DEFAULT_RADIO_OPTIONS]
        }
      }
      let grid_rows: string[] | undefined
      let grid_columns: string[] | undefined
      if (type === 'grid_radio' || type === 'grid_checkbox') {
        let rowsP = parseGridLabelsFromPayload(payload.rows)
        let colsP = parseGridLabelsFromPayload(payload.columns)
        if (rowsP.provided && rowsP.error) {
          return { errors: { rows: [rowsP.error] } }
        }
        if (colsP.provided && colsP.error) {
          return { errors: { columns: [colsP.error] } }
        }
        grid_rows = rowsP.labels ?? [...DEFAULT_GRID_ROWS]
        grid_columns = colsP.labels ?? [...DEFAULT_GRID_COLUMNS]
      }
      let label = String(payload.label || '').trim()
      if (!label) {
        return { errors: { label: ['Label is required'] } }
      }
      let newField: Field = {
        key: hexid(8),
        label,
        type,
        required: payload.required === 'on',
        options,
      }
      if (type === 'radio') {
        newField.radio_layout = normalizeRadioLayout(payload.radio_layout)
      }
      if (type === 'grid_radio' || type === 'grid_checkbox') {
        newField.rows = grid_rows
        newField.columns = grid_columns
      }
      let fields = [...formFields, newField]
      await Form.update(user.id, form.id, {
        fields,
      })
      return dataWithSuccess({ ok: true }, 'Field added')
    }

    case 'update_field': {
      let fieldKey = String(payload.field_key || '')
      if (!fieldKey) break
      let label = String(payload.label || '').trim()
      if (!label) {
        return { errors: { label: ['Label is required'] } }
      }
      let nextRadioOptions:
        | { options: Field['options']; error: null }
        | { options: null; error: string }
        | null = null
      let currentField = formFields.find((field) => field.key === fieldKey)
      if (currentField?.type === 'radio') {
        let parsedRadio = parseRadioOptionsFromPayload(payload.options)
        if (parsedRadio.provided) {
          if (parsedRadio.error) {
            return { errors: { options: [parsedRadio.error] } }
          }
          nextRadioOptions = {
            options: parsedRadio.options,
            error: null,
          }
        }
      }
      let nextGrid: { rows: string[]; cols: string[] } | null = null
      if (
        currentField?.type === 'grid_radio' ||
        currentField?.type === 'grid_checkbox'
      ) {
        let rowsP = parseGridLabelsFromPayload(payload.rows)
        let colsP = parseGridLabelsFromPayload(payload.columns)
        if (rowsP.provided) {
          if (rowsP.error) {
            return { errors: { rows: [rowsP.error] } }
          }
          if (!rowsP.labels) {
            return { errors: { rows: ['Labels are invalid'] } }
          }
        }
        if (colsP.provided) {
          if (colsP.error) {
            return { errors: { columns: [colsP.error] } }
          }
          if (!colsP.labels) {
            return { errors: { columns: ['Labels are invalid'] } }
          }
        }
        let rows =
          rowsP.provided && rowsP.labels
            ? rowsP.labels
            : currentField.rows || []
        let cols =
          colsP.provided && colsP.labels
            ? colsP.labels
            : currentField.columns || []
        if (!rows.length || !cols.length) {
          return {
            errors: {
              rows: ['Add at least one row label'],
              columns: ['Add at least one column label'],
            },
          }
        }
        nextGrid = { rows, cols }
      }
      let fields = formFields.map((field) => {
        if (field.key !== fieldKey) return field
        if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
          return {
            ...field,
            label,
            required: payload.required === 'on',
            rows: nextGrid!.rows,
            columns: nextGrid!.cols,
          }
        }
        let options: Field['options'] = null
        if (field.type === 'select') {
          options = String(payload.options || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        } else if (field.type === 'radio') {
          options = nextRadioOptions ? nextRadioOptions.options : field.options
        }
        return {
          ...field,
          label,
          required: payload.required === 'on',
          options:
            field.type === 'select' || field.type === 'radio' ? options : null,
          ...(field.type === 'radio'
            ? { radio_layout: normalizeRadioLayout(payload.radio_layout) }
            : {}),
        }
      })
      await Form.update(user.id, form.id, {
        fields,
      })
      return dataWithSuccess({ ok: true }, 'Field updated')
    }

    case 'delete_field': {
      let fieldKey = String(payload.field_key || payload.id || '')
      if (!fieldKey) break
      await Form.update(user.id, form.id, {
        fields: formFields.filter((field) => field.key !== fieldKey),
      })
      return dataWithSuccess(null, 'Field removed')
    }

    case 'reorder_fields': {
      let keys = String(payload.keys || '')
        .split(',')
        .filter(Boolean)
      if (!keys.length) break
      let byKey = new Map(formFields.map((f) => [f.key, f]))
      let fields = keys.map((k) => byKey.get(k)).filter(Boolean) as Field[]
      for (let f of formFields) {
        if (!keys.includes(f.key)) fields.push(f)
      }
      await Form.update(user.id, form.id, {
        fields,
      })
      return dataWithSuccess(null, 'Fields reordered')
    }
  }

  return null
}
