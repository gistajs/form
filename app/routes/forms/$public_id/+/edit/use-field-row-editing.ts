import { useEffect, useState } from 'react'

export function useFieldRowEditing(fetcher: Fetcher, initialEditing: boolean) {
  let [editing, setEditing] = useState(initialEditing)

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    if (fetcher.data?.errors) return
    if (fetcher.data) setEditing(false)
  }, [fetcher.data, fetcher.state])

  return { editing, setEditing }
}

type Fetcher = {
  state: string
  data?: { errors?: Record<string, string | string[]> } | null
}
