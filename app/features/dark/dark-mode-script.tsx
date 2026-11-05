export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        // Keep this as a stable string so server and client render identical HTML during hydration.
        __html: darkModeCode,
      }}
    />
  )
}

// Keep this aligned with applyTheme in use-dark-mode.ts.
const darkModeCode = String.raw`(function() {
  function applyTheme(theme) {
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

  let stored = localStorage.getItem('theme')
  let mode = stored === 'light' || stored === 'dark' ? stored : undefined
  let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(mode ?? (prefersDark ? 'dark' : 'light'))
})()`
