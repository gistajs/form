export function badRequestError(message?) {
  return new Response(message, {
    status: 400,
    statusText: 'Bad Request',
  })
}

export function notFoundError(message?) {
  return new Response(message, {
    status: 404,
    statusText: 'Not Found',
  })
}

export function methodNotAllowedError(message?) {
  return new Response(message, {
    status: 405,
    statusText: 'Method Not Allowed',
  })
}

export function unprocessableContentError(message?) {
  return new Response(message, {
    status: 422,
    statusText: 'Unprocessable Content',
  })
}
