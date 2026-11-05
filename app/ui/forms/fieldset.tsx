import { cn } from '~/lib/cn'

export function Fieldset({ title, children }) {
  return (
    <fieldset className="mb-12 fieldset space-y-6">
      <legend className="fieldset-legend w-full border-b border-base-300 text-lg font-semibold">
        {title}
      </legend>
      <Fields>{children}</Fields>
    </fieldset>
  )
}

export function Fields({ children }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-4">
      {children}
    </div>
  )
}

export function Field({ label = '', help = '', size = 'md', children }) {
  return (
    <>
      <div
        className={cn(
          'text-sm font-medium sm:col-span-2',
          size === 'sm' ? 'sm:pt-1.5' : 'sm:pt-2.5',
        )}
      >
        {label}
      </div>
      <div className="sm:col-span-6">{children}</div>
      <div
        className={cn(
          'sm:col-span-4',
          size === 'sm' ? 'sm:pt-1.5' : 'sm:pt-2.5',
        )}
      >
        <p className="text-sm text-gray-600">{help}</p>
      </div>
    </>
  )
}
