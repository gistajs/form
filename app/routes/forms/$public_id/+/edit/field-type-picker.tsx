import {
  AlignLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  CircleDotIcon,
  Grid2x2Icon,
  LayoutGridIcon,
  MailIcon,
  Rows3Icon,
  SquareCheckIcon,
  TypeIcon,
} from 'lucide-react'
import {
  FIELD_TYPE_META,
  FIELD_TYPES,
  type FieldType,
} from '~/features/form/fields'

const FIELD_TYPE_ICONS: Record<FieldType, typeof TypeIcon> = {
  text: TypeIcon,
  textarea: AlignLeftIcon,
  email: MailIcon,
  select: Rows3Icon,
  radio: CircleDotIcon,
  checkbox: SquareCheckIcon,
  grid_radio: LayoutGridIcon,
  grid_checkbox: Grid2x2Icon,
  date: CalendarIcon,
}

export function FieldTypePicker({ onAddField }: FieldTypePickerProps) {
  return (
    <details className="group mt-6 w-full">
      <summary className="btn h-auto min-h-10 w-fit max-w-full list-none gap-2 py-2.5 font-medium btn-soft btn-sm btn-primary marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon className="size-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180" />
        Add Field
      </summary>
      <div className="mt-3 rounded-lg border border-base-300 bg-base-100 p-4">
        <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3">
          {FIELD_TYPES.map((type) => {
            let meta = FIELD_TYPE_META[type]
            let Icon = FIELD_TYPE_ICONS[type]
            return (
              <div key={type} className="flex min-h-0">
                <button
                  type="button"
                  onClick={() => onAddField(type)}
                  className="flex h-full min-h-0 w-full cursor-pointer items-start gap-3 rounded-lg border border-base-300 bg-base-100 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{meta.label}</div>
                    <div className="text-xs text-base-content/50">
                      {meta.desc}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </details>
  )
}

type FieldTypePickerProps = {
  onAddField: (type: FieldType) => void
}
