import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import type { RadioOption } from './utils'

type RadioOptionsEditorProps = {
  defaultOptions: RadioOption[]
  /** When set, renders hidden input for fetcher.Form POST */
  nameForForm?: string
  /** Controlled mode (e.g. unsaved form row) */
  value?: RadioOption[]
  onChange?: (next: RadioOption[]) => void
}

export function RadioOptionsEditor({
  defaultOptions,
  nameForForm,
  value: controlledValue,
  onChange: controlledOnChange,
}: RadioOptionsEditorProps) {
  let controlled =
    controlledValue !== undefined && controlledOnChange !== undefined

  let [uncontrolled, setUncontrolled] = useState<RadioOption[]>(() =>
    defaultOptions.length
      ? defaultOptions.map((o) => ({ ...o }))
      : [{ primary: '' }],
  )

  let rows = controlled ? controlledValue! : uncontrolled
  let setRows = controlled ? controlledOnChange! : setUncontrolled

  let payload = JSON.stringify(
    rows
      .map((r) => {
        let primary = r.primary.trim()
        if (!primary) return null
        let secondary = r.secondary?.trim()
        return secondary ? { primary, secondary } : { primary }
      })
      .filter(Boolean),
  )

  let updateRow = (index: number, patch: Partial<RadioOption>) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  let addRow = () => {
    setRows([...rows, { primary: '', secondary: '' }])
  }

  let removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {nameForForm ? (
        <input type="hidden" name={nameForForm} value={payload} />
      ) : null}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wide text-base-content/45 uppercase">
              Primary
            </span>
            <input
              type="text"
              value={row.primary}
              onChange={(e) => updateRow(i, { primary: e.target.value })}
              placeholder="Label"
              className="input input-xs w-full min-w-0"
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wide text-base-content/45 uppercase">
              Secondary
            </span>
            <input
              type="text"
              value={row.secondary || ''}
              onChange={(e) => updateRow(i, { secondary: e.target.value })}
              placeholder="Optional"
              className="input input-xs w-full min-w-0"
            />
          </label>
          <button
            type="button"
            className="btn btn-circle shrink-0 btn-ghost btn-xs"
            onClick={() => removeRow(i)}
            aria-label="Remove option"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn w-fit gap-1 btn-ghost btn-xs"
        onClick={addRow}
      >
        <PlusIcon className="size-3" />
        Add option
      </button>
    </div>
  )
}
