import type { Dispatch, SetStateAction } from 'react'
import type { ActionData, UnsavedScaffold } from './types'

type NewScaffoldToolbarProps = {
  scaffold: UnsavedScaffold
  setScaffold: Dispatch<SetStateAction<UnsavedScaffold>>
  actionData: ActionData | undefined
  busy: boolean
  fieldRowsEditing: boolean
}

export function NewScaffoldToolbar({
  scaffold,
  setScaffold,
  actionData,
  busy,
  fieldRowsEditing,
}: NewScaffoldToolbarProps) {
  return (
    <div className="sticky top-16 z-20 -mx-6 mb-6 border-b border-base-300/50 bg-base-100/45 px-6 pt-3 backdrop-blur-lg sm:-mx-8 sm:px-8">
      <div className="pb-4">
        <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
          <input
            type="text"
            data-form-name
            value={scaffold.name}
            onChange={(event) =>
              setScaffold((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              if (busy || fieldRowsEditing) event.preventDefault()
            }}
            placeholder={scaffold.namePlaceholder?.trim() || 'Untitled Form'}
            className="input h-auto max-w-xl min-w-0 border-0 input-ghost px-0 text-2xl font-bold tracking-tight shadow-none outline-none focus:ring-0 focus:outline-none focus-visible:outline-none"
          />
          <UnsavedBadge />
        </div>

        {actionData?.errors?.name?.[0] ? (
          <p className="mt-1 text-sm text-error">{actionData.errors.name[0]}</p>
        ) : null}

        <textarea
          rows={1}
          value={scaffold.description}
          onChange={(event) =>
            setScaffold((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder={
            scaffold.descriptionPlaceholder?.trim() || 'Add a short description'
          }
          className="mt-1 block field-sizing-content h-auto min-h-0 w-full max-w-2xl resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-sm leading-6 text-base-content/60 shadow-none outline-none"
        />

        {actionData?.formError ? (
          <p className="mt-2 text-sm text-error">{actionData.formError}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={busy || fieldRowsEditing}
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
          <p className="text-xs text-base-content/50">
            Nothing is persisted until you save.
          </p>
        </div>
      </div>
    </div>
  )
}

function UnsavedBadge() {
  return (
    <span className="badge shrink-0 badge-soft badge-sm badge-warning">
      unsaved
    </span>
  )
}
