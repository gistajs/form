import { useState } from 'react'
import { useFetcher } from 'react-router'
import { useBusy } from '~/ui/hooks/use-busy'
import { useDialog } from '~/ui/hooks/use-dialog'
import { Modal } from './modal'

export function useDeleteModal() {
  let [deleteId, setDeleteId] = useState()
  let { dialogRef, openDialog } = useDialog()

  return {
    dialogRef,
    deleteId,
    openDialog: (id) => {
      if (id) setDeleteId(id)
      openDialog()
    },
  }
}

export function DeleteModal({
  dialogRef,
  id = '',
  title = 'Confirm Delete',
  children = 'Are you sure you want to delete?' as string | React.ReactNode,
  buttonLabel = 'Confirm Delete',
  verb = 'delete',
  action = undefined as string | undefined,
  disabled = false,
}) {
  let fetcher = useFetcher()
  let busy = useBusy()
  let close = () => dialogRef.current?.close()

  return (
    <Modal dialogRef={dialogRef}>
      <h3 className="text-lg font-bold">{disabled ? 'Attention!' : title}</h3>
      <p className="py-4 text-gray-500">{children}</p>
      <div className="modal-action">
        <fetcher.Form method="post" action={action}>
          <input type="hidden" name="verb" value={verb} />
          <input type="hidden" name="id" value={id} />
          {disabled || (
            <button
              type="submit"
              className="btn btn-error"
              onClick={close}
              disabled={busy}
            >
              {busy ? 'Deleting...' : buttonLabel}
            </button>
          )}
        </fetcher.Form>
        <button onClick={close} className="btn" disabled={busy}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export function DeleteButton({
  openLabel = 'Delete' as React.ReactNode,
  className = '',
  ...props
}) {
  let { dialogRef, openDialog } = useDeleteModal()

  return (
    <>
      <button
        onClick={openDialog}
        className={className || 'text-sm text-error'}
      >
        {openLabel}
      </button>
      <DeleteModal dialogRef={dialogRef} {...props} />
    </>
  )
}
