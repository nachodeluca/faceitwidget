export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly retryAfterMs?: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "ApiError"
  }
}

export function errorResponse(error: unknown) {
  const knownError = error instanceof ApiError

  if (!knownError) {
    console.error("Unhandled stats service error", error)
  }

  const apiError = knownError
    ? error
    : new ApiError(500, "The stats service could not complete the request.")
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Type": "application/json; charset=utf-8",
  })

  if (apiError.retryAfterMs) {
    headers.set("Retry-After", String(Math.ceil(apiError.retryAfterMs / 1000)))
  }

  return Response.json(
    { error: apiError.message },
    { status: apiError.status, headers },
  )
}
