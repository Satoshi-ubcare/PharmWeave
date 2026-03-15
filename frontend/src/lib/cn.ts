/** Tailwind 클래스를 조건부로 조합하는 유틸리티 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
