import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { InputError } from './input-error'

export function Calendar({
  name,
  defaultValue = undefined as string | Date | undefined,
  disabled = false,
  positionArea = 'top span-left',
  fixedWeeks = false,
}) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValue
      ? typeof defaultValue === 'string'
        ? new Date(defaultValue)
        : defaultValue
      : undefined,
  )

  return (
    <>
      <button
        type="button"
        popoverTarget={`rdp-popover-${name}`}
        className="input"
        style={{ anchorName: `--rdp-${name}` } as React.CSSProperties}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toLocaleDateString() : 'Pick a date'}
      </button>
      <div
        popover="auto"
        id={`rdp-popover-${name}`}
        className="dropdown"
        style={
          {
            positionAnchor: `--rdp-${name}`,
            positionArea,
          } as React.CSSProperties
        }
      >
        <input
          type="hidden"
          name={name}
          value={date ? date.toISOString().slice(0, 10) : ''}
        />
        <DayPicker
          className="react-day-picker"
          mode="single"
          timeZone="UTC"
          selected={date}
          onSelect={setDate}
          disabled={disabled}
          fixedWeeks={fixedWeeks}
        />
      </div>
      <InputError name={name} />
    </>
  )
}
