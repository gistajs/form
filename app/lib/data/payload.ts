// https://github.com/na2hiro/namespaced-fieldset/blob/main/src/index.tsx
import qs from 'qs'

export function payloadFromQuery(queryString: string) {
  return qs.parse(queryString, {
    allowDots: true,
    depth: 10,
    ignoreQueryPrefix: true, // Ignore the leading `?`
    arrayFormat: 'comma',
    commaRoundTrip: true,
  })
}

export function queryFromPayload(payload: Record<string, any>) {
  return decodeURIComponent(
    qs.stringify(payload, {
      arrayFormat: 'comma',
      commaRoundTrip: true,
    }),
  )
}

export async function payloadFromRequest(request: Request) {
  let formData = await request.formData()
  return payloadFromForm(formData)
}

export function payloadFromForm(formData: FormData) {
  let urlSearchParams = new URLSearchParams(formData as any)
  return payloadFromQuery(urlSearchParams.toString())
}

export function payloadFromSearch(request: Request) {
  return payloadFromQuery(new URL(request.url).search)
}
