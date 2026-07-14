// 매물 유형 캘리그라피풍 손그림 아이콘 (잉크 라인 + 클레이 포인트)
const ACCENT = 'var(--spot)'

const PATHS = {
  store: (
    <>
      <path d="M9 21 Q13 11 20 11 L44 11 Q51 11 55 21" />
      <path d="M9 21 Q12.8 27 16.7 21 M16.7 21 Q20.5 27 24.3 21 M24.3 21 Q28.2 27 32 21 M32 21 Q35.8 27 39.7 21 M39.7 21 Q43.5 27 47.3 21 M47.3 21 Q51.2 27 55 21" />
      <path d="M13 24 Q12.6 38 13 51 M51 24 Q51.4 38 51 51" />
      <path d="M7 51.5 Q32 50.4 57 51.5" />
      <path d="M39 35.8 Q42.5 35.3 45.8 35.8 L45.8 42.2 Q42.3 42.7 39 42.2 Z" />
      <path stroke={ACCENT} d="M23 51 L23 37.5 Q23 35.3 25.2 35.3 L31 35.3 Q33.2 35.3 33.2 37.5 L33.2 51" />
    </>
  ),
  office: (
    <>
      <path d="M20 51 Q19.6 32 20 13 Q20 11 22 11 L42 11 Q44 11 44 13 Q44.4 32 44 51" />
      <path d="M14 51.5 Q32 50.5 50 51.5" />
      <path d="M26.5 19.5 L31 19.5 M33.8 19.5 L38.3 19.5 M26.5 27 L31 27 M33.8 27 L38.3 27 M26.5 34.5 L31 34.5 M33.8 34.5 L38.3 34.5" />
      <path d="M28.5 51 L28.5 43.2 Q28.5 41.2 30.5 41.2 L33.8 41.2 Q35.8 41.2 35.8 43.2 L35.8 51" />
      <path stroke={ACCENT} d="M37 10.5 L37 4.5 Q40.8 5.4 37 7.4" />
    </>
  ),
  home: (
    <>
      <path d="M8 31 Q32 8.5 56 31" />
      <path d="M15 27.5 Q14.6 40 15 51 M49 27.5 Q49.4 40 49 51" />
      <path d="M11 51.5 Q32 50.5 53 51.5" />
      <path d="M27 51 L27 40.2 Q27 38.2 29 38.2 L35 38.2 Q37 38.2 37 40.2 L37 51" />
      <path d="M43.5 15.5 L43.5 9.8 L49 9.8 L49 20.5" />
      <circle stroke={ACCENT} cx="41.5" cy="30.5" r="3.4" />
    </>
  ),
  land: (
    <>
      <path d="M7 49 Q16 28 23 40 Q29.5 24 40 45 Q47 33 57 49" />
      <path d="M5 49.5 Q32 48.5 59 49.5" />
      <circle stroke={ACCENT} cx="49" cy="15" r="5.2" />
      <path d="M13 44.5 Q15.5 41 18 44.5" />
    </>
  ),
}

export default function TypeIcon({ type }) {
  const content = PATHS[type]
  if (!content) return null
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {content}
    </svg>
  )
}
