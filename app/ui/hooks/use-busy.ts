import { useFetchers, useNavigation } from 'react-router'

export function useBusy() {
  let navigation = useNavigation()
  let fetchers = useFetchers()

  let busy =
    navigation.state !== 'idle' ||
    fetchers.some((fetcher) => fetcher.state !== 'idle')

  return busy
}
