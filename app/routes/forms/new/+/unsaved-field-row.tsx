import { PencilIcon, TrashIcon } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import { useEffect, useState } from 'react'
import { FIELD_TYPE_META } from '~/features/form/fields'
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  normalizeGridLabels,
} from '~/features/form/grid'
import {
  RadioFieldSummaryInline,
  RadioLayoutSelect,
  RadioOptionsEditor,
} from '~/features/form/radio'
import {
  DEFAULT_RADIO_LAYOUT,
  DEFAULT_RADIO_OPTIONS,
  normalizeRadioOptions,
  radioOptionsFromField,
  type RadioLayout,
  type RadioOption,
} from '~/features/form/radio/utils'
import type { Field } from '~/features/form/types'
import { DragHandle } from '~/ui/drag-handle'
import { FieldOptionsEditor } from './field-options-editor'
import { GridLabelsEditor } from './grid-labels-editor'
import type { UnsavedField } from './types'

type UnsavedFieldRowProps = {
  field: UnsavedField
  busy: boolean
  hideHandle?: boolean
  onFieldEditingChange?: (fieldKey: string, editing: boolean) => void
  onSave: (field: Field) => void
  onDelete: () => void
}

export function UnsavedFieldRow({
  field,
  busy,
  hideHandle,
  onFieldEditingChange,
  onSave,
  onDelete,
}: UnsavedFieldRowProps) {
  let [editing, setEditing] = useState(Boolean(field.isNew))
  let [label, setLabel] = useState(field.label)
  let [required, setRequired] = useState(field.required)
  let [selectOptions, setSelectOptions] = useState<string[]>(() =>
    field.type === 'select' ? (field.options as string[]) || [] : [],
  )
  let [radioOptions, setRadioOptions] = useState<RadioOption[]>(() =>
    field.type === 'radio'
      ? (field.options as RadioOption[])?.length
        ? [...(field.options as RadioOption[])]
        : [...DEFAULT_RADIO_OPTIONS]
      : [],
  )
  let [radioLayout, setRadioLayout] = useState<RadioLayout>(() =>
    field.type === 'radio'
      ? (field.radio_layout ?? DEFAULT_RADIO_LAYOUT)
      : DEFAULT_RADIO_LAYOUT,
  )
  let [gridRows, setGridRows] = useState<string[]>(() =>
    field.type === 'grid_radio' || field.type === 'grid_checkbox'
      ? [...(field.rows?.length ? field.rows : DEFAULT_GRID_ROWS)]
      : [],
  )
  let [gridCols, setGridCols] = useState<string[]>(() =>
    field.type === 'grid_radio' || field.type === 'grid_checkbox'
      ? [...(field.columns?.length ? field.columns : DEFAULT_GRID_COLUMNS)]
      : [],
  )
  let [error, setError] = useState('')
  let [dragging, setDragging] = useState(false)
  let dragControls = useDragControls()

  useEffect(() => {
    onFieldEditingChange?.(field.key, editing)
    return () => onFieldEditingChange?.(field.key, false)
    // Intentionally omit onFieldEditingChange: parent does not memoize it.
  }, [editing, field.key])

  function reset() {
    setLabel(field.label)
    setRequired(field.required)
    setSelectOptions((field.options as string[]) || [])
    setRadioOptions(
      field.type === 'radio'
        ? (field.options as RadioOption[])?.length
          ? [...(field.options as RadioOption[])]
          : [...DEFAULT_RADIO_OPTIONS]
        : [],
    )
    setRadioLayout(
      field.type === 'radio'
        ? (field.radio_layout ?? DEFAULT_RADIO_LAYOUT)
        : DEFAULT_RADIO_LAYOUT,
    )
    if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
      setGridRows(field.rows?.length ? [...field.rows] : [...DEFAULT_GRID_ROWS])
      setGridCols(
        field.columns?.length ? [...field.columns] : [...DEFAULT_GRID_COLUMNS],
      )
    }
    setError('')
  }

  function save() {
    let nextLabel = label.trim()
    if (!nextLabel) {
      setError('Label is required')
      return
    }

    let nextOptions: Field['options'] = null
    if (field.type === 'select') {
      nextOptions = selectOptions.filter(Boolean)
    } else if (field.type === 'radio') {
      let normalized = normalizeRadioOptions(radioOptions)
      if (!normalized?.length) {
        setError('Add at least one option with a primary label')
        return
      }
      nextOptions = normalized
    }

    if (field.type === 'grid_radio' || field.type === 'grid_checkbox') {
      let nr = normalizeGridLabels(gridRows)
      let nc = normalizeGridLabels(gridCols)
      if (!nr || !nc) {
        setError('Row and column labels must be unique and non-empty')
        return
      }
      onSave({
        key: field.key,
        label: nextLabel,
        type: field.type,
        required,
        options: null,
        rows: nr,
        columns: nc,
      })
      setEditing(false)
      setError('')
      return
    }

    onSave({
      key: field.key,
      label: nextLabel,
      type: field.type,
      required,
      options: nextOptions,
      ...(field.type === 'radio' ? { radio_layout: radioLayout } : {}),
    })
    setEditing(false)
    setError('')
  }

  let content = editing ? (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <div className="w-5 shrink-0" />
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              save()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              if (field.isNew) {
                onDelete()
                return
              }
              reset()
              setEditing(false)
            }
          }}
          placeholder={FIELD_TYPE_META[field.type].defaultLabel}
          autoFocus
          className="input input-sm min-w-0 flex-1"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-base-content/60">
          <input
            type="checkbox"
            checked={required}
            onChange={(event) => setRequired(event.target.checked)}
            className="checkbox checkbox-xs"
          />
          Required
        </label>
        <button
          type="button"
          className="btn shrink-0 btn-xs btn-primary"
          onClick={save}
        >
          Save
        </button>
        <button
          type="button"
          className="btn shrink-0 btn-ghost btn-xs"
          onClick={() => {
            if (field.isNew) {
              onDelete()
              return
            }
            reset()
            setEditing(false)
          }}
        >
          Cancel
        </button>
      </div>

      {field.type === 'select' ? (
        <FieldOptionsEditor
          options={selectOptions}
          onChange={setSelectOptions}
        />
      ) : null}
      {field.type === 'radio' ? (
        <>
          <RadioLayoutSelect
            labelClassName="ml-7"
            value={radioLayout}
            onChange={setRadioLayout}
          />
          <RadioOptionsEditor
            defaultOptions={[]}
            value={radioOptions}
            onChange={setRadioOptions}
          />
        </>
      ) : null}
      {field.type === 'grid_radio' || field.type === 'grid_checkbox' ? (
        <GridLabelsEditor
          defaultRows={[]}
          defaultColumns={[]}
          valueRows={gridRows}
          valueColumns={gridCols}
          onChangeRows={setGridRows}
          onChangeColumns={setGridCols}
        />
      ) : null}

      {error ? <p className="ml-7 text-sm text-error">{error}</p> : null}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {hideHandle ? (
        <div className="w-5 shrink-0" />
      ) : (
        <DragHandle dragControls={dragControls} />
      )}

      <div className="min-w-0 flex-1">
        <span className="font-medium">{field.label}</span>
        {field.required ? <span className="ml-1 text-error">*</span> : null}
        {field.type === 'select' && field.options?.length ? (
          <span className="ml-2 inline-flex flex-wrap gap-1">
            {(field.options as string[]).map((option) => (
              <span key={option} className="badge badge-ghost badge-xs">
                {option}
              </span>
            ))}
          </span>
        ) : null}
        {field.type === 'radio' && field.options?.length ? (
          <RadioFieldSummaryInline
            options={radioOptionsFromField(field)}
            layout={field.radio_layout}
          />
        ) : null}
        {(field.type === 'grid_radio' || field.type === 'grid_checkbox') &&
        field.rows?.length &&
        field.columns?.length ? (
          <span className="ml-2 text-xs text-base-content/50">
            {field.rows.length}×{field.columns.length} grid
          </span>
        ) : null}
      </div>

      <span className="badge badge-ghost badge-sm">
        {field.type.replace(/_/g, ' ')}
      </span>

      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={() => {
          reset()
          setEditing(true)
        }}
        disabled={busy}
      >
        <PencilIcon className="size-3.5" />
      </button>

      <button
        type="button"
        className="btn text-error btn-ghost btn-xs"
        onClick={onDelete}
      >
        <TrashIcon className="size-3.5" />
      </button>
    </div>
  )

  return (
    <Reorder.Item
      value={field}
      layout="position"
      dragListener={false}
      dragControls={dragControls}
      className="rounded-lg border border-base-300 bg-base-100 px-3 py-2"
      animate={
        dragging
          ? { scale: 1.02, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }
          : { scale: 1, boxShadow: 'none' }
      }
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
    >
      {content}
    </Reorder.Item>
  )
}
