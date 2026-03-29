import { useRef } from 'react'

export function useDialog() {
  let dialogRef = useRef<HTMLDialogElement>(null)

  return {
    dialogRef,
    openDialog: (e?) => {
      e?.preventDefault()
      // try {
      dialogRef.current?.showModal()
      // } catch (e) {
      //   // FIXME, or maybe no longer needed: Sometimes Safari throws InvalidStateError
      //   // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
      //   console.error(e)
      // }
    },
    closeDialog: () => {
      dialogRef.current?.close()
    },
  }
}
