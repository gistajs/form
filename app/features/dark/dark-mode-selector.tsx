import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '~/lib/cn'
import { useDarkMode } from './use-dark-mode'

const NAME = 'theme-tabs'
const OPTIONS = [
  { key: 'system', label: 'System', icon: MonitorIcon, mode: undefined },
  { key: 'light', label: 'Light', icon: SunIcon, mode: 'light' },
  { key: 'dark', label: 'Dark', icon: MoonIcon, mode: 'dark' },
]

export function DarkModeSelector({ className = '' }) {
  let { mode, setMode, ready } = useDarkMode()

  return (
    <div
      className={cn('tabs-box tabs w-fit flex-nowrap tabs-xs', className)}
      role="tablist"
      aria-label="Theme"
    >
      {OPTIONS.map((option) => {
        let Icon = option.icon
        let checked =
          ready &&
          (mode === option.mode || (option.mode == null && mode == null))
        let id = `${NAME}-${option.key}`

        return (
          <Fragment key={option.key}>
            <input
              type="radio"
              id={id}
              name={NAME}
              className="sr-only"
              aria-label={option.label}
              checked={checked}
              onChange={() => setMode(option.mode as any)}
            />
            <label
              htmlFor={id}
              className={cn(
                'tab flex items-center justify-center',
                checked && 'tab-active',
              )}
              role="tab"
              aria-selected={checked}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="sr-only">{option.label}</span>
            </label>
          </Fragment>
        )
      })}
    </div>
  )
}
