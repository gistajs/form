import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

type GridLabelsEditorProps = {
  defaultRows: string[]
  defaultColumns: string[]
  /** fetcher.Form: hidden input names; omit when controlled (e.g. unsaved row inside Form) */
  nameRows?: string
  nameColumns?: string
  valueRows?: string[]
  valueColumns?: string[]
  onChangeRows?: (rows: string[]) => void
  onChangeColumns?: (cols: string[]) => void
}

export function GridLabelsEditor({
  defaultRows,
  defaultColumns,
  nameRows,
  nameColumns,
  valueRows,
  valueColumns,
  onChangeRows,
  onChangeColumns,
}: GridLabelsEditorProps) {
  let controlled =
    valueRows !== undefined &&
    valueColumns !== undefined &&
    onChangeRows !== undefined &&
    onChangeColumns !== undefined

  let [ur, setUr] = useState(() => [...defaultRows])
  let [uc, setUc] = useState(() => [...defaultColumns])

  let rows = controlled ? valueRows! : ur
  let cols = controlled ? valueColumns! : uc
  let setRows = controlled ? onChangeRows! : setUr
  let setCols = controlled ? onChangeColumns! : setUc

  let payloadRows = JSON.stringify(rows.filter(Boolean))
  let payloadCols = JSON.stringify(cols.filter(Boolean))

  return (
    <div className="ml-7 flex flex-col gap-3">
      {!controlled && nameRows != null && nameColumns != null ? (
        <>
          <input type="hidden" name={nameRows} value={payloadRows} />
          <input type="hidden" name={nameColumns} value={payloadCols} />
        </>
      ) : null}
      <AxisList
        label="Rows"
        items={rows}
        onChange={setRows}
        placeholder="Row label"
      />
      <AxisList
        label="Columns"
        items={cols}
        onChange={setCols}
        placeholder="Column label"
      />
    </div>
  )
}

function AxisList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (next: string[]) => void
  placeholder: string
}) {
  let [input, setInput] = useState('')

  function add() {
    let value = input.trim()
    if (!value || items.includes(value)) return
    onChange([...items, value])
    setInput('')
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium tracking-wide text-base-content/45 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="badge gap-1 border-base-300 bg-base-200 pr-1 badge-sm"
          >
            {item}
            <button
              type="button"
              className="rounded-full hover:text-error"
              onClick={() => remove(index)}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder={placeholder}
            className="input input-xs w-28 min-w-0"
          />
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-xs"
            onClick={add}
          >
            <PlusIcon className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
