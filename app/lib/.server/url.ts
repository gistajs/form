export function currentPath(request: Request) {
  return new URL(request.url).pathname
}

export function getSearchParam(request: Request, key: string) {
  return new URL(request.url).searchParams.get(key) ?? undefined
}
