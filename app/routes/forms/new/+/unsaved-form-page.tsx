import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Reorder } from 'motion/react'
import { useRef, useState } from 'react'
import { Form, useActionData, useNavigation, useSubmit } from 'react-router'
import type { AvailabilityCandidatesHandle } from '~/features/form/availability-poll/candidates/section'
import { buildFormField, type FieldType } from '~/features/form/fields'
import {
  toPreviewForm,
  type FormDraftScaffold,
  type FormScaffold,
} from '~/features/form/scaffold'
import type { Field } from '~/features/form/types'
import { cn } from '~/lib/cn'
import { hexid } from '~/lib/data/hexid'
import { FieldTypePicker } from '../../$public_id/+/edit/field-type-picker'
import { FormPreview } from '../../$public_id/+/preview/form-preview'
import { NewScaffoldToolbar } from './new-scaffold-toolbar'
import type { ActionData, UnsavedScaffold } from './types'
import { UnsavedAvailabilityForm } from './unsaved-availability-form'
import { UnsavedFieldRow } from './unsaved-field-row'

type UnsavedFormPageProps = {
  initialScaffold: FormDraftScaffold
}

export function UnsavedFormPage({ initialScaffold }: UnsavedFormPageProps) {
  let actionData = useActionData<ActionData>()
  let navigation = useNavigation()
  let submit = useSubmit()
  let availabilityRef = useRef<AvailabilityCandidatesHandle>(null)
  let busy = navigation.state !== 'idle'
  let [showPreview, setShowPreview] = useState(false)
  let [scaffold, setScaffold] = useState<UnsavedScaffold>(initialScaffold)
  let previewForm = toPreviewForm(scaffold)
  let isAvailabilityPoll = scaffold.kind === 'availability_poll'

  let [editingFieldKeys, setEditingFieldKeys] = useState(
    () => new Set<string>(),
  )

  function reportFieldEditing(fieldKey: string, editing: boolean) {
    setEditingFieldKeys((prev) => {
      let has = prev.has(fieldKey)
      if (editing && has) return prev
      if (!editing && !has) return prev
      let next = new Set(prev)
      if (editing) next.add(fieldKey)
      else next.delete(fieldKey)
      return next
    })
  }

  let fieldRowsEditing = editingFieldKeys.size > 0

  function addField(type: FieldType) {
    setScaffold((current) => ({
      ...current,
      fields: [
        ...current.fields,
        {
          ...buildFormField(type, hexid(8)),
          isNew: true,
        },
      ],
    }))
  }

  function updateField(fieldKey: string, next: Field) {
    setScaffold((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.key === fieldKey ? { ...next } : field,
      ),
    }))
  }

  function removeField(fieldKey: string) {
    setEditingFieldKeys((prev) => {
      if (!prev.has(fieldKey)) return prev
      let next = new Set(prev)
      next.delete(fieldKey)
      return next
    })
    setScaffold((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.key !== fieldKey),
    }))
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-xs lg:hidden"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <EyeOffIcon className="size-3.5" />
          ) : (
            <EyeIcon className="size-3.5" />
          )}
          {showPreview ? 'Questions' : 'Preview'}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)]">
        <Form
          method="POST"
          onSubmit={(event) => {
            if (fieldRowsEditing) {
              event.preventDefault()
              return
            }
            if (
              scaffold.kind === 'availability_poll' &&
              availabilityRef.current &&
              scaffold.config
            ) {
              event.preventDefault()
              let canonical = availabilityRef.current.flushToCanonical()
              let nextScaffold: UnsavedScaffold = {
                ...scaffold,
                config: { ...scaffold.config, candidate_lines: canonical },
              }
              setScaffold(nextScaffold)
              let fd = new FormData()
              fd.set(
                'scaffold',
                JSON.stringify(serializeScaffold(nextScaffold)),
              )
              submit(fd, { method: 'post' })
            }
          }}
          onKeyDownCapture={(event) => {
            if (event.key !== 'Enter') return
            let target = event.target
            if (target instanceof HTMLTextAreaElement) return
            if (target instanceof HTMLButtonElement) return
            if (
              target instanceof HTMLElement &&
              target.hasAttribute('data-form-name')
            )
              return
            event.preventDefault()
          }}
          className={cn(
            showPreview ? 'hidden lg:block' : '',
            'min-w-0 lg:sticky lg:top-60 lg:z-10 lg:self-start',
          )}
        >
          <input
            type="hidden"
            name="scaffold"
            value={JSON.stringify(serializeScaffold(scaffold))}
          />

          <NewScaffoldToolbar
            scaffold={scaffold}
            setScaffold={setScaffold}
            actionData={actionData}
            busy={busy}
            fieldRowsEditing={fieldRowsEditing}
          />

          {isAvailabilityPoll ? (
            <UnsavedAvailabilityForm
              ref={availabilityRef}
              config={scaffold.config}
              onChange={(config) =>
                setScaffold((current) => ({
                  ...current,
                  config,
                }))
              }
            />
          ) : scaffold.fields.length === 0 ? (
            <p className="text-sm text-base-content/50">
              No fields yet. Open Add Field below to choose a type.
            </p>
          ) : null}

          {!isAvailabilityPoll && (
            <Reorder.Group
              axis="y"
              values={scaffold.fields}
              onReorder={(fields) =>
                setScaffold((current) => ({
                  ...current,
                  fields,
                }))
              }
              className="space-y-2"
            >
              {scaffold.fields.map((field) => (
                <UnsavedFieldRow
                  key={field.key}
                  field={field}
                  busy={busy}
                  hideHandle={fieldRowsEditing}
                  onFieldEditingChange={reportFieldEditing}
                  onSave={(next) => updateField(field.key, next)}
                  onDelete={() => removeField(field.key)}
                />
              ))}
            </Reorder.Group>
          )}

          {!isAvailabilityPoll ? (
            <FieldTypePicker onAddField={addField} />
          ) : null}
        </Form>

        <div
          className={cn('min-w-0', showPreview ? 'block' : 'hidden lg:block')}
        >
          <FormPreview form={previewForm} readOnly title="Live Preview" />
        </div>
      </div>
    </>
  )
}

function serializeScaffold(scaffold: UnsavedScaffold): FormScaffold {
  let { namePlaceholder, descriptionPlaceholder, fields, ...rest } = scaffold
  return {
    ...rest,
    fields: fields.map(({ isNew: _isNew, ...field }) => field),
  }
}
