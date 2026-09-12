import { useId } from 'react'
import { Link } from 'react-router'
import { cn } from '~/lib/cn'

export function PopoverMenu({ id, className, button, items, children }: Props) {
  let fallback = useId()
  let target = id ?? fallback

  return (
    <>
      <button
        type="button"
        className={cn('cursor-pointer', className)}
        popoverTarget={`popover-${target}`}
        style={{ anchorName: `--anchor-${target}` } as React.CSSProperties}
      >
        {button}
      </button>

      <ul
        className="menu dropdown mt-1 w-56 rounded-box border border-base-300 bg-base-100 shadow-lg"
        popover="auto"
        id={`popover-${target}`}
        style={
          {
            positionAnchor: `--anchor-${target}`,
            positionArea: 'bottom span-left',
          } as React.CSSProperties
        }
      >
        {items.map((item) => (
          <li key={item.href} className={item.className}>
            <Link to={item.href}>{item.label}</Link>
          </li>
        ))}
        {children}
      </ul>
    </>
  )
}

type Props = {
  id?: string
  className?: string
  button: React.ReactNode
  items: {
    label: string
    href: string
    className?: string
  }[]
  children?: React.ReactNode
}
