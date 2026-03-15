import axios from 'axios'

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
 *
 * 판별 우선순위:
 *  1. axios.isAxiosError() — Axios 공식 타입 가드로 AxiosError 식별
 *  2. response.data.error  — 서버가 반환한 { error: string } 메시지
 *  3. HTTP 상태 코드      — response는 있으나 표준 형식이 아닌 경우
 *  4. 네트워크/타임아웃  — request는 전송됐으나 response 없음
 *  5. fallback            — 그 외 예상치 못한 에러
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (isApiErrorResponse(data)) return data.error
    if (err.response) return `서버 오류 (HTTP ${err.response.status})`
    if (err.request) return '서버에 연결할 수 없습니다.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return fallback
}
