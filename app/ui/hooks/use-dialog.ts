import { useRef } from 'react'

export function useDialog() {
  let dialogRef = useRef<HTMLDialogElement>(null)

  return {
    dialogRef,
    openDialog: (e?) => {
      e?.preventDefault()
      dialogRef.current?.showModal()
    },
    closeDialog: () => {
      dialogRef.current?.close()
    },
  }
}
