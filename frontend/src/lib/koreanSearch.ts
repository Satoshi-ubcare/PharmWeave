/**
 * 한국어 초성 검색 유틸리티
 *
 * 한글 음절 구조: 가(0xAC00) ~ 힣(0xD7A3)
 * 각 음절 = 초성(19) × 중성(21) × 종성(28) = 11,172자
 * 음절 코드 = 0xAC00 + 초성_idx × 588 + 중성_idx × 28 + 종성_idx
 */

const CHOSUNG = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
] as const

/** 입력 문자가 단독 한글 자음(초성 후보)인지 확인 */
function isKoreanConsonant(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return code >= 0x3131 && code <= 0x314E
}

/** 완성형 한글 음절에서 초성 추출. 음절이 아니면 ch 그대로 반환 */
function getChosung(ch: string): string {
  const code = ch.charCodeAt(0) - 0xAC00
  if (code < 0 || code > 11171) return ch
  return CHOSUNG[Math.floor(code / 588)]
}

/**
 * 초성 검색을 포함한 한국어 부분 일치 검사
 *
 * - query 의 각 글자가 자음이면 target 의 해당 위치 초성과 비교
 * - 완성형 음절 / 알파벳은 일반 문자 비교
 * - target 의 어느 부분 문자열이든 일치하면 true
 */
export function matchesKoreanSearch(query: string, target: string): boolean {
  if (!query) return true

  const q = query.toLowerCase()
  const t = target.toLowerCase()

  // 1. 일반 포함 검사 (완성형 쿼리 빠른 경로)
  if (t.includes(q)) return true

  // 2. 초성 슬라이딩 윈도우 검사
  const qChars = [...q]
  const tChars = [...t]
  const len = tChars.length - qChars.length

  for (let i = 0; i <= len; i++) {
    let match = true
    for (let j = 0; j < qChars.length; j++) {
      const qCh = qChars[j]
      const tCh = tChars[i + j]
      if (isKoreanConsonant(qCh)) {
        if (getChosung(tCh) !== qCh) { match = false; break }
      } else {
        if (qCh !== tCh) { match = false; break }
      }
    }
    if (match) return true
  }

  return false
}

/**
 * 쿼리에서 단독 자음을 제거한 API 전송용 문자열 반환
 * 예) "ㅇ" → ""  /  "연ㅅ" → "연"  /  "연세" → "연세"
 */
export function toApiQuery(query: string): string {
  return [...query].filter(ch => !isKoreanConsonant(ch)).join('')
}
