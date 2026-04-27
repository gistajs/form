import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Reorder } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigation, useOutletContext } from 'react-router'
import { buildFormField, type FieldType } from '~/features/form/fields'
import type { Field, FormSelect } from '~/features/form/types'
import { cn } from '~/lib/cn'
import { hexid } from '~/lib/data/hexid'
import { AvailabilityForm } from './+/edit/availability-form'
import { FieldRow } from './+/edit/field-row'
import { FieldTypePicker } from './+/edit/field-type-picker'
import { useReorderFields } from './+/edit/use-reorder-fields'
import { FormPreview } from './+/preview/form-preview'

type DraftField = Field & {
  isDraft: true
}

export { action } from './+/edit/action'

export default function Page() {
  let { form } = useOutletContext<{ form: FormSelect }>()
  let persistedFields = form.fields || []
  let navigation = useNavigation()
  let busy = navigation.state !== 'idle'
  let [showPreview, setShowPreview] = useState(false)
  let [draftFields, setDraftFields] = useState<DraftField[]>([])
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
  let { orderedFields, handleReorder, handleDragEnd } =
    useReorderFields(persistedFields)
  let isAvailabilityPoll = form.kind === 'availability_poll'
  let savedPollLines =
    isAvailabilityPoll && form.config ? form.config.candidate_lines : null
  let [previewCandidateLines, setPreviewCandidateLines] = useState<
    string | null
  >(null)

  useEffect(() => {
    setPreviewCandidateLines(null)
  }, [savedPollLines, form.public_id])

  let previewForm = useMemo(() => {
    let fields = [...orderedFields, ...draftFields]
    if (!isAvailabilityPoll || !form.config) {
      return { ...form, fields }
    }
    let lines =
      previewCandidateLines !== null
        ? previewCandidateLines
        : form.config.candidate_lines
    return {
      ...form,
      fields,
      config: { ...form.config, candidate_lines: lines },
    }
  }, [
    form,
    orderedFields,
    draftFields,
    previewCandidateLines,
    isAvailabilityPoll,
  ])

  function addField(type: FieldType) {
    setDraftFields((current) => [
      ...current,
      {
        ...buildFormField(type, hexid(8)),
        isDraft: true,
      },
    ])
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          className="btn btn-ghost btn-xs xl:hidden"
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

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div
          className={cn(
            showPreview ? 'hidden xl:block' : '',
            // Clear sticky nav (4rem) + form bar/tabs (~11rem); top-8 hid under that stack
            'min-w-0 xl:sticky xl:top-60 xl:z-10 xl:self-start',
          )}
        >
          <div>
            {isAvailabilityPoll ? (
              <AvailabilityForm
                form={form}
                onPreviewCandidateLines={setPreviewCandidateLines}
              />
            ) : orderedFields.length === 0 && draftFields.length === 0 ? (
              <p className="text-sm text-base-content/50">
                No fields yet. Open Add Field below to choose a type.
              </p>
            ) : null}
            {!isAvailabilityPoll && (
              <Reorder.Group
                axis="y"
                values={orderedFields}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {orderedFields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    busy={busy}
                    initialEditing={false}
                    hideHandle={fieldRowsEditing}
                    onEditingChange={reportFieldEditing}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </Reorder.Group>
            )}
            {!isAvailabilityPoll && (
              <div
                className={cn(
                  'space-y-2',
                  orderedFields.length > 0 && draftFields.length > 0
                    ? 'mt-2'
                    : '',
                )}
              >
                {draftFields.map((field) => (
                  <FieldRow
                    key={`${field.key}:draft`}
                    field={field}
                    busy={busy}
                    initialEditing
                    hideHandle={fieldRowsEditing}
                    isDraft
                    onEditingChange={reportFieldEditing}
                    onDraftSaved={() =>
                      setDraftFields((current) =>
                        current.filter((item) => item.key !== field.key),
                      )
                    }
                    onDraftCancel={() =>
                      setDraftFields((current) =>
                        current.filter((item) => item.key !== field.key),
                      )
                    }
                    onDragEnd={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {!isAvailabilityPoll ? (
            <FieldTypePicker onAddField={addField} />
          ) : null}
        </div>

        <div
          className={cn('min-w-0', showPreview ? 'block' : 'hidden xl:block')}
        >
          <FormPreview form={previewForm} readOnly title="Live Preview" />
        </div>
      </div>
    </>
  )
}
