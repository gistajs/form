import { cn } from '~/lib/cn'
import { DEFAULT_RADIO_LAYOUT, type RadioLayout } from './utils'

const SELECT_CLASS = 'select w-full max-w-xs min-w-44 select-xs'
const LABEL_BASE =
  'flex flex-wrap items-center gap-2 text-xs text-base-content/70'

const RADIO_LAYOUT_OPTIONS: { value: RadioLayout; label: string }[] = [
  { value: 'auto', label: 'Auto (by options)' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
]

type RadioLayoutSelectProps = {
  labelClassName?: string
} & (
  | {
      name: string
      defaultValue?: RadioLayout
    }
  | {
      value: RadioLayout
      onChange: (v: RadioLayout) => void
    }
)

export function RadioLayoutSelect(props: RadioLayoutSelectProps) {
  let labelClass = cn(LABEL_BASE, props.labelClassName)
  let options = RADIO_LAYOUT_OPTIONS.map(({ value, label }) => (
    <option key={value} value={value}>
      {label}
    </option>
  ))

  return (
    <label className={labelClass}>
      <span className="shrink-0">Option layout</span>
      {'name' in props ? (
        <select
          name={props.name}
          className={SELECT_CLASS}
          defaultValue={props.defaultValue ?? DEFAULT_RADIO_LAYOUT}
        >
          {options}
        </select>
      ) : (
        <select
          className={SELECT_CLASS}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value as RadioLayout)}
        >
          {options}
        </select>
      )}
    </label>
  )
}
