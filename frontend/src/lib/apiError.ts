interface ApiErrorResponse {
  error: string
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorResponse).error === 'string'
  )
}

/**
 * Axios 에러에서 서버 응답 메시지를 추출한다.
 * 서버 응답이 없으면 fallback 메시지를 반환한다.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response
    if (isApiErrorResponse(response?.data)) return response.data.error
  }
  if (err instanceof Error) return err.message
  return fallback
}
