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

  // Initialize on mount - only set ready, theme already applied by DarkModeScript
  useEffect(() => {
    setReady(true)
  }, [])

  // Handle mode changes from user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ready) return // Don't apply during initial render

    if (mode === 'light' || mode === 'dark') {
      localStorage.setItem('theme', mode)
    } else {
      localStorage.removeItem('theme')
    }

    applyTheme(mode ?? (prefersDark ? 'dark' : 'light'))
  }, [mode, prefersDark, ready])

  return { mode, setMode, ready }
}

// Observe the resolved theme from document.documentElement
export function useResolvedTheme(defaultTheme: ResolvedTheme = 'light') {
  let [theme, setTheme] = useState<ResolvedTheme>(defaultTheme)

  useEffect(() => {
    let stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
    } else {
      setTheme(defaultTheme)
    }

    let observer = new MutationObserver(() => {
      let stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
      } else {
        setTheme(defaultTheme)
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [defaultTheme])

  return theme
}

// Keep this aligned with applyTheme in dark-mode-script.tsx.
function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  let light = document.getElementById('hljs-theme-light')
  let dark = document.getElementById('hljs-theme-dark')

  if (light instanceof HTMLLinkElement) {
    light.media = theme === 'light' ? 'all' : 'not all'
  }

  if (dark instanceof HTMLLinkElement) {
    dark.media = theme === 'dark' ? 'all' : 'not all'
  }
}
