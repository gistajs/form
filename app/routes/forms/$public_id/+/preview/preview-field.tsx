import { GRID_ROW_PARAM_PREFIX } from '~/features/form/grid'
import {
  radioOptionsFromField,
  resolveRadioOrientation,
} from '~/features/form/radio/utils'
import type { Field } from '~/features/form/types'
import { cn } from '~/lib/cn'
import { Calendar } from '~/ui/forms/calendar'

export function PreviewField({ field }: { field: Field }) {
  let name = `field_${field.key}`

  if (field.type === 'date') {
    return (
      <div>
        <FieldLabel field={field} />
        <Calendar name={name} />
      </div>
    )
  }

  if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
    let rows = field.rows || []
    let cols = field.columns || []
    if (!rows.length || !cols.length) {
      return (
        <div>
          <FieldLabel field={field} />
          <p className="text-sm text-base-content/50">
            No rows or columns configured
          </p>
        </div>
      )
    }
    let isRadio = field.type === 'grid_radio'
    return (
      <fieldset className="min-w-0 space-y-2">
        <legend className="mb-1.5 block w-full text-sm font-medium text-base-content/70">
          {field.label}
          {field.required && <span className="ml-0.5 text-error/60">*</span>}
        </legend>
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="w-1/4 bg-base-200/80" />
                {cols.map((col, c) => (
                  <th
                    key={c}
                    className="min-w-18 bg-base-200/80 text-center text-xs font-medium normal-case"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowLabel, r) => (
                <tr key={r}>
                  <th className="max-w-48 bg-base-100 text-left text-xs font-medium whitespace-normal">
                    {rowLabel}
                  </th>
                  {cols.map((_, c) => (
                    <td key={c} className="text-center align-middle">
                      {isRadio ? (
                        <input
                          type="radio"
                          name={`${name}[${GRID_ROW_PARAM_PREFIX}${r}]`}
                          value={String(c)}
                          className="radio radio-sm radio-primary"
                          required={field.required && c === 0}
                          aria-label={`${rowLabel}: ${cols[c]}`}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          name={`${name}[${GRID_ROW_PARAM_PREFIX}${r}][]`}
                          value={String(c)}
                          className="checkbox checkbox-sm checkbox-primary"
                          aria-label={`${rowLabel}: ${cols[c]}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5">
        <input
          type="checkbox"
          name={name}
          className="toggle toggle-primary toggle-sm"
        />
        <span className="text-sm">
          {field.label}
          {field.required && <span className="ml-0.5 text-error/60">*</span>}
        </span>
      </label>
    )
  }

  if (field.type === 'radio') {
    let opts = radioOptionsFromField(field)
    if (!opts.length) {
      return (
        <div>
          <FieldLabel field={field} />
          <p className="text-sm text-base-content/50">No options configured</p>
        </div>
      )
    }
    let orientation = resolveRadioOrientation(field, opts)
    return (
      <fieldset className="space-y-2">
        <legend className="mb-1.5 block w-full text-sm font-medium text-base-content/70">
          {field.label}
          {field.required && <span className="ml-0.5 text-error/60">*</span>}
        </legend>
        <div
          className={
            orientation === 'vertical' ? 'space-y-2' : 'flex flex-wrap gap-2'
          }
        >
          {opts.map((opt, i) => (
            <label
              key={i}
              className={cn(
                'relative flex cursor-pointer rounded-lg border-2 border-base-300 bg-base-100 px-3 transition-[border-color,background-color,box-shadow]',
                'hover:border-primary/35',
                'has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary',
                'focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-base-100',
                opt.secondary?.trim() ? 'py-2.5' : 'items-center py-2',
                orientation === 'horizontal' &&
                  opt.secondary?.trim() &&
                  'max-w-[min(100%,22rem)]',
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.primary}
                className="sr-only"
                required={field.required && i === 0}
              />
              {opt.secondary?.trim() ? (
                <div className="min-w-0">
                  <div className="text-sm font-medium">{opt.primary}</div>
                  <div className="text-sm text-base-content/60">
                    {opt.secondary}
                  </div>
                </div>
              ) : (
                <span className="text-sm font-medium tabular-nums">
                  {opt.primary}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        <FieldLabel field={field} />
        <select
          name={name}
          className="select w-full rounded-lg"
          required={field.required}
        >
          <option value="">Select...</option>
          {(field.options as string[]).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <FieldLabel field={field} />
        <textarea
          name={name}
          className="textarea w-full rounded-lg"
          rows={3}
          required={field.required}
        />
      </div>
    )
  }

  let inputType = field.type === 'email' ? 'email' : 'text'

  return (
    <div>
      <FieldLabel field={field} />
      <input
        type={inputType}
        name={name}
        className="input w-full rounded-lg"
        required={field.required}
      />
    </div>
  )
}

function FieldLabel({ field }: { field: Field }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-base-content/70">
      {field.label}
      {field.required && <span className="ml-0.5 text-error/60">*</span>}
    </label>
  )
}
