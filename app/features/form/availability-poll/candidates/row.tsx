import { Trash2Icon } from 'lucide-react'
import { cn } from '~/lib/cn'
import type { CandidateLineRow } from '../parse-candidates'

type PersistedRowBlockProps = {
  row: CandidateLineRow
  flash: { trimmedLine: string; occurrence: number } | null
  onRemove: () => void
  onChangeDated: (rest: string) => void
  onBlurSort: () => void
}

export function PersistedRowBlock({
  row,
  flash,
  onRemove,
  onChangeDated,
  onBlurSort,
}: PersistedRowBlockProps) {
  let flashActive =
    flash &&
    flash.trimmedLine === row.trimmedLine &&
    flash.occurrence === row.occurrence

  if (row.invalidDate) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2 py-1.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 font-mono text-xs text-base-content/80">
          {row.trimmedLine}
        </div>
        <p className="shrink-0 text-[11px] text-warning">
          Invalid date — remove and add again.
        </p>
        <button
          type="button"
          className="btn btn-square shrink-0 btn-ghost btn-xs sm:ml-auto"
          aria-label="Remove"
          onClick={onRemove}
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
    )
  }

  if (row.datePrefix != null) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-lg border border-transparent px-2 py-0.5 transition-shadow duration-0',
          flashActive && 'border-primary/40 ring-2 ring-primary/50',
        )}
      >
        <div className="shrink-0 font-mono text-xs text-base-content/70">
          {row.datePrefix}
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Time or note after date</span>
          <input
            type="text"
            className="input-bordered input input-xs w-full font-mono text-xs"
            value={row.rest ?? ''}
            onChange={(e) => onChangeDated(e.target.value)}
            onBlur={onBlurSort}
          />
        </label>
        <button
          type="button"
          className="btn btn-square shrink-0 btn-ghost btn-xs"
          aria-label="Remove option"
          onClick={onRemove}
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 rounded-lg border border-base-300 bg-base-100 px-2 py-1 transition-shadow duration-0',
        flashActive && 'ring-2 ring-primary/50',
      )}
    >
      <div className="min-w-0 flex-1 font-mono text-xs text-base-content/80">
        {row.trimmedLine}
      </div>
      <button
        type="button"
        className="btn btn-square shrink-0 btn-ghost btn-xs"
        aria-label="Remove option"
        onClick={onRemove}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  )
}
