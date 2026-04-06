import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function ErrorBoundary() {
  let error = useRouteError() as any
  let { is4xx, title, message, is404 } = errorBoundaryState(error)

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 py-20">
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
      {is404 ? (
        <div>
          <p>
            Sorry, but the thing you are looking for is not found. Please check
            the URL and try again.
          </p>
          <Link to="/" className="link">
            Go to home page
          </Link>
        </div>
      ) : is4xx ? null : (
        <p>We are on it — please try again later.</p>
      )}
      <pre>
        <code className="font-mono text-sm whitespace-pre-wrap text-error">
          {message}
        </code>
      </pre>
    </div>
  )
}

function errorBoundaryState(error: any) {
  let isRouteError = isRouteErrorResponse(error)
  let is4xx = isRouteError && error.status < 500
  let title = is4xx
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong!'
  let message = isRouteError
    ? typeof error.data === 'string'
      ? error.data
      : (error.data?.message ?? `${error.status} ${error.statusText}`)
    : (error?.message ?? 'Unknown error')
  let is404 = isRouteError && error.status === 404

  return { is4xx, title, message, is404 }
}
