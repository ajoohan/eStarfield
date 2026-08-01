// 문자열의 '\n'을 모바일 전용 줄바꿈(<br class="br-m">)으로 변환한다.
// 데스크톱에서는 .br-m이 display:none이라 공백 하나로 이어져 보인다.
export function mbr(text) {
  if (typeof text !== 'string' || !text.includes('\n')) return text
  return text.split('\n').flatMap((part, i) => (i === 0 ? [part] : [' ', <br key={i} className="br-m" />, part]))
}
