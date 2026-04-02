import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import type { Field } from '~/features/form/types'

export function useReorderFields(fields: Field[]) {
  let [orderedFields, setOrderedFields] = useState(fields)
  let orderedRef = useRef(orderedFields)
  let reorderFetcher = useFetcher()
  let fieldsSnapshot = JSON.stringify(fields)

  useEffect(() => {
    if (reorderFetcher.state !== 'idle') return

    let fieldMap = new Map(fields.map((field) => [field.key, field]))
    let nextFields = orderedRef.current
      .map((field) => fieldMap.get(field.key))
      .filter(Boolean) as Field[]

    for (let field of fields) {
      if (!nextFields.some((item) => item.key === field.key)) {
        nextFields.push(field)
      }
    }

    orderedRef.current = nextFields
    setOrderedFields(nextFields)
  }, [fieldsSnapshot, fields, reorderFetcher.state])

  function handleReorder(newOrder: Field[]) {
    setOrderedFields(newOrder)
    orderedRef.current = newOrder
  }

  function handleDragEnd() {
    reorderFetcher.submit(
      {
        verb: 'reorder_fields',
        keys: orderedRef.current.map((f) => f.key).join(','),
      },
      { method: 'POST' },
    )
  }

  return { orderedFields, handleReorder, handleDragEnd }
}
