// 공용 스트로크 아이콘 — 이모지 대신 브랜드 톤에 맞는 라인 아이콘 사용
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5.5 3.5h3l1.7 4.2-2.1 1.6a12.5 12.5 0 0 0 6.6 6.6l1.6-2.1 4.2 1.7v3a1.9 1.9 0 0 1-2 1.9A16.4 16.4 0 0 1 3.6 5.5a1.9 1.9 0 0 1 1.9-2Z" />
    </svg>
  )
}

export function ArrowUpRight(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export function MenuIcon({ open, ...props }) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8.2h16M4 15.8h16" />}
    </svg>
  )
}
