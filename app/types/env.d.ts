declare global {
  interface Window {
    ENV: Record<string, string | undefined>
  }
}

export {}
