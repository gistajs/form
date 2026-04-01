import { useRouteLoaderData } from 'react-router'

type RootLoaderData = {
  user?: {
    id: number
    email: string
    name: string | null
    bag: any
  }
}

export function useOptionalUser() {
  let data = useRouteLoaderData<RootLoaderData>('root')
  return data?.user
}
