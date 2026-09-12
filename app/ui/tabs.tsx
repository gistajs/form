import { NavLink, useLocation, useNavigate } from 'react-router'
import { cn } from '~/lib/cn'

export function NavTabs({ tabs, orientation = 'horizontal' }) {
  let navigate = useNavigate()
  let { pathname } = useLocation()
  let currentTab = tabs.find((tab) => tab.href === pathname) || tabs[0]

  return (
    <Tabs
      tabs={tabs}
      value={currentTab?.href}
      onChange={(href) => navigate(href)}
      orientation={orientation}
      mode="navigation"
    />
  )
}

export function Tabs({
  tabs,
  value,
  onChange,
  orientation = 'horizontal',
  mode = 'navigation' as 'navigation' | 'button',
}) {
  let normalizedTabs = tabs.map((tab) => ({
    ...tab,
    key: tab.name?.toString?.() || tab.value,
    value: tab.value || tab.href,
  }))
  let id = `tabs-${normalizedTabs.map((tab) => tab.value).join('-')}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let isHorizontal = orientation === 'horizontal'

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor={id} className="sr-only">
          Select a tab
        </label>
        <select
          id={id}
          name="tabs"
          className="select my-2 w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {normalizedTabs.map((tab) => (
            <option key={tab.key} value={tab.value}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className={cn('hidden sm:block', !isHorizontal && 'overflow-x-auto')}
      >
        <div
          className={cn(
            isHorizontal
              ? 'my-2 border-b border-base-300'
              : 'border-r border-gray-200',
          )}
        >
          <nav
            className={cn(
              isHorizontal
                ? '-mb-px flex space-x-8'
                : '-mr-px flex flex-col gap-y-1',
            )}
            aria-label="Tabs"
          >
            {normalizedTabs.map((tab) => (
              <Tab
                key={tab.key}
                tab={tab}
                value={value}
                mode={mode}
                onChange={onChange}
                isHorizontal={isHorizontal}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

function Tab({ tab, value, mode, onChange, isHorizontal }) {
  let isActive = value === tab.value

  let className = isHorizontal
    ? cn(
        'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content/80',
      )
    : cn(
        'border-r-2 px-4 py-3 text-sm font-medium',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content/80',
      )

  if (mode === 'navigation') {
    return (
      <NavLink
        to={tab.href}
        end={tab.end}
        className={({ isActive }) =>
          isHorizontal
            ? cn(
                'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content/80',
              )
            : cn(
                'border-r-2 px-4 py-3 text-sm font-medium',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content/80',
              )
        }
      >
        {tab.name}
      </NavLink>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onChange(tab.value)}
      className={cn(className, 'cursor-pointer text-left')}
      aria-current={isActive ? 'page' : undefined}
    >
      {tab.name}
    </button>
  )
}
