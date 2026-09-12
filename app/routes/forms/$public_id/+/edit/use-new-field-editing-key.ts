import { useEffect, useRef, useState } from 'react'
import type { Field } from '~/features/form/types'

export function useNewFieldEditingKey(fields: Field[]) {
  let [editingKey, setEditingKey] = useState<string | null>(null)
  let prevFieldKeys = useRef(fields.map((field) => field.key))

  useEffect(() => {
    let nextKeys = fields.map((field) => field.key)
    let addedKey = nextKeys.find((key) => !prevFieldKeys.current.includes(key))
    prevFieldKeys.current = nextKeys
    if (addedKey) setEditingKey(addedKey)
  }, [fields])

  return editingKey
}
