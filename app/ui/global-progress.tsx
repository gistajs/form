import { useNavigation } from 'react-router'
import { cn } from '~/lib/cn'

export function GlobalProgress() {
  let navigation = useNavigation()
  let progress = {
    idle: { width: 'w-full opacity-0 transition-all', value: 0 },
    submitting: { width: 'w-1/2', value: 50 },
    loading: { width: 'w-full', value: 100 },
  }[navigation.state]

  return (
    <div
      role="progressbar"
      aria-hidden={navigation.state === 'idle'}
      aria-valuenow={progress.value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 animate-pulse"
    >
      <div
        className={cn(
          'h-full bg-linear-to-r from-primary/50 to-primary transition-all duration-500 ease-in-out',
          progress.width,
        )}
      />
    </div>
  )
}
