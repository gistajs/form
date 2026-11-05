import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

type FieldOptionsEditorProps = {
  options: string[]
  onChange: (options: string[]) => void
}

export function FieldOptionsEditor({
  options,
  onChange,
}: FieldOptionsEditorProps) {
  let [input, setInput] = useState('')

  function addOption() {
    let value = input.trim()
    if (!value || options.includes(value)) return
    onChange([...options, value])
    setInput('')
  }

  return (
    <div className="ml-7 flex flex-wrap items-center gap-1.5">
      {options.map((option, index) => (
        <span
          key={`${option}-${index}`}
          className="badge gap-1 border-base-300 bg-base-200 pr-1 badge-sm"
        >
          {option}
          <button
            type="button"
            className="rounded-full hover:text-error"
            onClick={() =>
              onChange(
                options.filter((_, optionIndex) => optionIndex !== index),
              )
            }
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addOption()
            }
          }}
          placeholder="Add option"
          className="input input-xs w-24 min-w-0"
        />
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-xs"
          onClick={addOption}
        >
          <PlusIcon className="size-3" />
        </button>
      </div>
    </div>
  )
}
