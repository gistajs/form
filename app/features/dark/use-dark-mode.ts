import { useEffect, useState } from 'react'
import { useMediaQuery } from '~/ui/hooks/use-media-query'

export type ThemeMode = 'light' | 'dark' | undefined
type ResolvedTheme = 'light' | 'dark'

export function useDarkMode() {
  let prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  let [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return undefined
    let stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' ? stored : undefined
  })
  let [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ready) return

    if (mode === 'light' || mode === 'dark') {
      localStorage.setItem('theme', mode)
    } else {
      localStorage.removeItem('theme')
    }

    applyTheme(mode ?? (prefersDark ? 'dark' : 'light'))
  }, [mode, prefersDark, ready])

  return { mode, setMode, ready }
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}
