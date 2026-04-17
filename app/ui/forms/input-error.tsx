import { useActionData } from 'react-router'

export function InputError({ name, fetcher = null as Fetcher | null }) {
  let actionData = useActionData()
  let errors = fetcher?.data?.errors ?? actionData?.errors
  let messages = errors?.[name]
  if (!messages?.length) return null

  let normalized = Array.isArray(messages) ? messages : [String(messages)]

  return (
    <div className="space-y-1">
      {normalized.map((message, i) => (
        <p className="text-sm text-error" key={i}>
          {message}
        </p>
      ))}
    </div>
  )
}

type Fetcher = { data?: { errors?: Record<string, string | string[]> } }
