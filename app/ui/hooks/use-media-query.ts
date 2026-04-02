import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  let [matches, setMatches] = useState(false)

  useEffect(() => {
    let media = window.matchMedia(query)
    let sync = () => setMatches(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [query])

  return matches
}
