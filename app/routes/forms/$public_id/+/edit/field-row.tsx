import { PencilIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { FIELD_TYPE_META } from '~/features/form/fields'
import { DEFAULT_GRID_COLUMNS, DEFAULT_GRID_ROWS } from '~/features/form/grid'
import {
  RadioFieldSummaryInline,
  RadioLayoutSelect,
  RadioOptionsEditor,
} from '~/features/form/radio'
import { radioOptionsFromField } from '~/features/form/radio/utils'
import type { Field } from '~/features/form/types'
import { GridLabelsEditor } from '~/routes/forms/new/+/grid-labels-editor'
import { DeleteButton } from '~/ui/delete-modal'
import { DragHandle } from '~/ui/drag-handle'
import { InputError } from '~/ui/forms/input-error'
import { useFieldRowEditing } from './use-field-row-editing'

export function FieldRow({
  field,
  busy,
  initialEditing,
  hideHandle,
  isDraft = false,
  onDraftSaved,
  onDraftCancel,
  onEditingChange,
  onDragEnd,
}: FieldRowProps) {
  let fetcher = useFetcher()
  let { editing, setEditing } = useFieldRowEditing(fetcher, initialEditing)

  useEffect(() => {
    onEditingChange?.(field.key, editing)
    return () => onEditingChange?.(field.key, false)
  }, [editing, field.key])
  let [dragging, setDragging] = useState(false)
  let dragControls = useDragControls()

  useEffect(() => {
    if (!isDraft) return
    if (fetcher.state !== 'idle') return
    if (!fetcher.data || fetcher.data.errors) return
    onDraftSaved?.()
  }, [fetcher.data, fetcher.state, isDraft, onDraftSaved])

  let content = (
    <div className="flex items-center gap-2">
      {isDraft || editing || hideHandle ? (
        <div className="w-5 shrink-0" />
      ) : (
        <DragHandle dragControls={dragControls} />
      )}

      {editing ? (
        <fetcher.Form
          method="POST"
          className="flex min-w-0 flex-1 flex-col gap-2"
        >
          <input
            type="hidden"
            name="verb"
            value={isDraft ? 'add_field' : 'update_field'}
          />
          {isDraft ? (
            <input type="hidden" name="type" value={field.type} />
          ) : (
            <input type="hidden" name="field_key" value={field.key} />
          )}
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="text"
              name="label"
              defaultValue={field.label}
              placeholder={FIELD_TYPE_META[field.type].defaultLabel}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="input input-sm min-w-0 flex-1"
            />
            <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-base-content/60">
              <input
                type="checkbox"
                name="required"
                className="checkbox checkbox-xs"
                defaultChecked={field.required}
              />
              Required
            </label>
            <button type="submit" className="btn shrink-0 btn-xs btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn shrink-0 btn-ghost btn-xs"
              onClick={() => {
                setEditing(false)
                if (isDraft) onDraftCancel?.()
              }}
            >
              Cancel
            </button>
          </div>
          {field.type === 'select' && (
            <SelectOptionsEditor
              defaultOptions={(field.options as string[]) || []}
            />
          )}
          {field.type === 'radio' && (
            <>
              <RadioLayoutSelect
                name="radio_layout"
                defaultValue={field.radio_layout ?? undefined}
              />
              <RadioOptionsEditor
                defaultOptions={radioOptionsFromField(field)}
                nameForForm="options"
              />
              <InputError name="options" fetcher={fetcher} />
            </>
          )}
          {(field.type === 'grid_radio' || field.type === 'grid_checkbox') && (
            <>
              <GridLabelsEditor
                defaultRows={field.rows ?? [...DEFAULT_GRID_ROWS]}
                defaultColumns={field.columns ?? [...DEFAULT_GRID_COLUMNS]}
                nameRows="rows"
                nameColumns="columns"
              />
              <InputError name="rows" fetcher={fetcher} />
              <InputError name="columns" fetcher={fetcher} />
            </>
          )}
          <InputError name="label" fetcher={fetcher} />
        </fetcher.Form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <span className="font-medium">{field.label}</span>
            {field.required && <span className="ml-1 text-error">*</span>}
            {field.type === 'select' && field.options?.length ? (
              <span className="ml-2 inline-flex flex-wrap gap-1">
                {(field.options as string[]).map((opt) => (
                  <span key={opt} className="badge badge-ghost badge-xs">
                    {opt}
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
            onClick={() => setEditing(true)}
            disabled={busy}
          >
            <PencilIcon className="size-3.5" />
          </button>

          {isDraft ? (
            <button
              type="button"
              className="btn text-error btn-ghost btn-xs"
              onClick={onDraftCancel}
            >
              <TrashIcon className="size-3.5" />
            </button>
          ) : (
            <DeleteButton
              id={field.key}
              verb="delete_field"
              title="Remove Field"
              buttonLabel="Remove Field"
              openLabel={<TrashIcon className="size-3.5" />}
              className="btn text-error btn-ghost btn-xs"
            >
              Remove &ldquo;{field.label}&rdquo;? This cannot be undone.
            </DeleteButton>
          )}
        </>
      )}
    </div>
  )

  if (isDraft) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2">
        {content}
      </div>
    )
  }

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
      onDragEnd={() => {
        setDragging(false)
        onDragEnd()
      }}
    >
      {content}
    </Reorder.Item>
  )
}

type FieldRowProps = {
  field: Field
  busy: boolean
  initialEditing: boolean
  hideHandle?: boolean
  isDraft?: boolean
  onDraftSaved?: () => void
  onDraftCancel?: () => void
  onEditingChange?: (fieldKey: string, editing: boolean) => void
  onDragEnd: () => void
}

function SelectOptionsEditor({ defaultOptions }: SelectOptionsEditorProps) {
  let [options, setOptions] = useState(defaultOptions)
  let [input, setInput] = useState('')

  let addOption = () => {
    let value = input.trim()
    if (!value || options.includes(value)) return
    setOptions([...options, value])
    setInput('')
  }

  let removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="options" value={options.join(', ')} />
      {options.map((opt, i) => (
        <span
          key={`${opt}-${i}`}
          className="badge gap-1 border-base-300 bg-base-200 pr-1 badge-sm"
        >
          {opt}
          <button
            type="button"
            className="rounded-full hover:text-error"
            onClick={() => removeOption(i)}
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
              addOption()
            }
          }}
          placeholder="Add option"
          className="input input-xs w-24 min-w-0"
        />
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-xs"
          onClick={addOption}
        >
          <PlusIcon className="size-3" />
        </button>
      </div>
    </div>
  )
}

type SelectOptionsEditorProps = {
  defaultOptions: string[]
}
