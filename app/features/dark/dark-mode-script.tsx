export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(${darkModeScript.toString()})()`,
      }}
    />
  )
}

function darkModeScript() {
  // Keep this aligned with applyTheme in use-dark-mode.ts.
  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }

  let stored = localStorage.getItem('theme')
  let mode: 'light' | 'dark' | undefined =
    stored === 'light' || stored === 'dark' ? stored : undefined
  let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(mode ?? (prefersDark ? 'dark' : 'light'))
}
