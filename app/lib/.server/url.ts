// request.url keeps React Router's `.data` suffix on client navigations, so map
// `/foo.data` to `/foo` and `/foo/_.data` to `/foo/` (`/_.data` to `/`)
export function currentPath(request: Request) {
  let { pathname } = new URL(request.url)
  if (pathname.endsWith('/_.data')) return pathname.slice(0, -'_.data'.length)
  return pathname.replace(/\.data$/, '')
}

export function getSearchParam(request: Request, key: string) {
  return new URL(request.url).searchParams.get(key) ?? undefined
}
