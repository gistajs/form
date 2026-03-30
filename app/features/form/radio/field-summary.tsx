import {
  DEFAULT_RADIO_LAYOUT,
  type RadioLayout,
  type RadioOption,
} from './utils'

export function RadioFieldSummaryInline({
  options,
  layout,
}: {
  options: RadioOption[]
  layout?: RadioLayout | null
}) {
  return (
    <>
      <span className="ml-2 inline-flex flex-wrap gap-1">
        {options.map((opt, i) => (
          <span
            key={i}
            className="badge max-w-[200px] truncate badge-ghost badge-xs"
            title={opt.secondary}
          >
            {opt.primary}
            {opt.secondary ? ` · ${opt.secondary}` : ''}
          </span>
        ))}
      </span>
      <RadioLayoutHint layout={layout} />
    </>
  )
}

function RadioLayoutHint({
  layout,
}: {
  layout: RadioLayout | null | undefined
}) {
  let v = layout ?? DEFAULT_RADIO_LAYOUT
  if (v === 'auto') return null
  return (
    <span className="ml-1 text-[10px] text-base-content/45">
      · {v === 'horizontal' ? 'horizontal' : 'vertical'}
    </span>
  )
}
