import { GripVerticalIcon } from 'lucide-react'
import type { DragControls } from 'motion/react'

export function DragHandle({ dragControls }: { dragControls: DragControls }) {
  return (
    <button
      type="button"
      className="cursor-grab touch-none text-base-content/40 hover:text-base-content/70 active:cursor-grabbing"
      onPointerDown={(e) => dragControls.start(e)}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}
