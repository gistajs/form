import { cn } from '~/lib/cn'

export function Modal({
  dialogRef,
  children,
  dismissible = false,
  className = 'max-h-[95vh] max-w-xl',
}) {
  function close() {
    dialogRef.current?.close()
  }

  return (
    <dialog ref={dialogRef} className="modal">
      <div className={cn('modal-box', className)}>
        {dismissible && (
          <button
            type="button"
            className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
            onClick={close}
          >
            ✕
          </button>
        )}
        <div>{children}</div>
      </div>
      {/* modal-backdrop covers the screen so we can close the modal when clicked outside */}
      {dismissible && (
        <button
          type="button"
          className="modal-backdrop"
          onClick={close}
          aria-label="Close modal"
        />
      )}
    </dialog>
  )
}
