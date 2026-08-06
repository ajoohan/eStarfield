import { useEffect, useState } from 'react'
import { adminClient } from '../../lib/amplifyClient.js'

// AppSync API 키 만료 예정일(최초 배포 2026-07-19 + 365일).
// 백엔드를 재배포하면 뒤로 밀리므로 어디까지나 추정치다.
// 만료되면 공개 사이트의 매물·게시물이 통째로 조회되지 않는다.
const API_KEY_EXPIRES = new Date('2027-07-19')
const API_KEY_WARN_DAYS = 90

const DISMISS_KEY = 'estarfield.admin.notices.dismissed'

function daysUntil(date) {
  return Math.ceil((date - new Date()) / 86400000)
}

/**
 * 실제 데이터를 검사해 운영자가 조치할 항목을 만든다.
 * 조치가 끝나면 항목이 저절로 사라지도록 항상 현재 데이터 기준으로 계산한다.
 */
function buildNotices({ listings, inquiries }) {
  const out = []

  const pending = inquiries.filter((i) => !i.handled)
  if (pending.length) {
    out.push({
      id: 'inquiry-pending',
      level: 'action',
      title: `답변하지 않은 문의 ${pending.length}건`,
      desc: '문의함에서 회신을 남기면 고객에게 답변 메일이 자동 발송됩니다.',
      tab: 'inquiries',
    })
  }

  const noUnit = listings.filter((l) => !l.floor)
  if (noUnit.length) {
    out.push({
      id: 'listing-no-unit',
      level: 'action',
      title: `동·호수가 없는 매물 ${noUnit.length}건`,
      desc: '같은 단지 매물이 목록에서 구분되지 않습니다. 수정에서 «동·호수 / 층»을 채워 주세요.',
      tab: 'listings',
      items: noUnit.map((l) => l.title),
    })
  }

  const noImage = listings.filter((l) => !l.thumb)
  if (noImage.length) {
    out.push({
      id: 'listing-no-image',
      level: 'action',
      title: `대표 이미지가 없는 매물 ${noImage.length}건`,
      desc: '이미지가 없으면 유형별 기본 사진이 대신 표시됩니다.',
      tab: 'listings',
      items: noImage.map((l) => `${l.title}${l.floor ? ` (${l.floor})` : ''}`),
    })
  }

  const noLocation = listings.filter((l) => !l.location)
  if (noLocation.length) {
    out.push({
      id: 'listing-no-location',
      level: 'suggest',
      title: `위치가 비어 있는 매물 ${noLocation.length}건`,
      desc: '화면 표시에는 문제가 없지만, 관리자 검색에 위치가 쓰이므로 채워두면 찾기 편합니다.',
      tab: 'listings',
    })
  }

  // 면적 표기 혼용: "전용" 접두어가 붙은 것과 안 붙은 것이 섞여 있는 경우
  const areas = listings.filter((l) => l.area)
  const withPrefix = areas.filter((l) => /^전용/.test(l.area.trim()))
  if (withPrefix.length && withPrefix.length !== areas.length) {
    out.push({
      id: 'area-style',
      level: 'suggest',
      title: '면적 표기가 섞여 있습니다',
      desc: `«전용»을 붙인 매물 ${withPrefix.length}건, 붙이지 않은 매물 ${areas.length - withPrefix.length}건. 한쪽으로 통일하면 목록이 정돈됩니다(붙일 때는 «전용 84㎡»처럼 띄어쓰기 권장).`,
      tab: 'listings',
    })
  }

  // 제목과 동·호수가 모두 같은 매물 = 중복 등록 가능성
  const seen = new Map()
  listings.forEach((l) => {
    const key = `${l.title}|${l.floor || ''}`
    seen.set(key, (seen.get(key) || 0) + 1)
  })
  const dupes = [...seen.entries()].filter(([, n]) => n > 1)
  if (dupes.length) {
    const total = dupes.reduce((s, [, n]) => s + n, 0)
    out.push({
      id: 'listing-dupe',
      level: 'suggest',
      title: `중복으로 보이는 매물 ${total}건`,
      desc: '제목과 동·호수가 똑같은 매물입니다. 같은 매물을 두 번 올린 것이라면 하나만 남겨 주세요.',
      tab: 'listings',
      items: dupes.map(([key, n]) => `${key.replace('|', ' ')} — ${n}건`),
    })
  }

  const hidden = listings.filter((l) => !l.isActive)
  if (hidden.length) {
    out.push({
      id: 'listing-hidden',
      level: 'suggest',
      title: `비공개 상태인 매물 ${hidden.length}건`,
      desc: '홈페이지에 노출되지 않습니다. 거래가 끝난 매물이면 그대로 두셔도 됩니다.',
      tab: 'listings',
    })
  }

  const left = daysUntil(API_KEY_EXPIRES)
  if (left <= API_KEY_WARN_DAYS) {
    out.push({
      id: 'api-key',
      level: 'action',
      title: `홈페이지 접속키 만료 ${left}일 전`,
      desc: '만료되면 홈페이지에서 매물이 보이지 않게 됩니다. 개발자에게 갱신을 요청해 주세요.',
    })
  }

  return out
}

export default function AdminNotices({ onGo }) {
  const [notices, setNotices] = useState([])
  const [open, setOpen] = useState(null)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    let alive = true
    // 알림은 보조 기능이다. 어떤 이유로 실패하더라도 관리자 화면 자체를 막아서는 안 되므로
    // 모델 접근 자체를 try 안에서 한다(로컬처럼 설정이 불완전하면 models가 비어 있을 수 있다).
    ;(async () => {
      try {
        const [l, i] = await Promise.all([
          adminClient.models.Listing.list({ limit: 500 }),
          adminClient.models.Inquiry.list({ limit: 500 }),
        ])
        if (!alive) return
        setNotices(buildNotices({ listings: l.data || [], inquiries: i.data || [] }))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[adminNotices] 알림을 계산하지 못했습니다.', err?.message || err)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  function dismiss(id) {
    const next = [...new Set([...dismissed, id])]
    setDismissed(next)
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next))
  }

  function restore() {
    setDismissed([])
    localStorage.removeItem(DISMISS_KEY)
  }

  const shown = notices.filter((n) => !dismissed.includes(n.id))
  const hiddenCount = notices.length - shown.length

  if (!notices.length) return null

  if (!shown.length) {
    return (
      <div className="adm-notice-clear">
        <span>조치할 항목이 없습니다.</span>
        {hiddenCount > 0 && (
          <button type="button" onClick={restore}>
            숨긴 알림 {hiddenCount}개 다시 보기
          </button>
        )}
      </div>
    )
  }

  return (
    <section className="adm-notices" aria-label="운영 알림">
      <div className="adm-notices-head">
        <h3>운영 알림</h3>
        <span className="adm-notices-count">{shown.length}건</span>
        {hiddenCount > 0 && (
          <button type="button" className="adm-notices-restore" onClick={restore}>
            숨긴 알림 {hiddenCount}개 보기
          </button>
        )}
      </div>

      <ul className="adm-notice-list">
        {shown.map((n) => (
          <li key={n.id} className={`adm-notice adm-notice-${n.level}`}>
            <div className="adm-notice-body">
              <strong>{n.title}</strong>
              <p>{n.desc}</p>

              {n.items?.length > 0 && (
                <>
                  <button
                    type="button"
                    className="adm-notice-toggle"
                    onClick={() => setOpen(open === n.id ? null : n.id)}
                    aria-expanded={open === n.id}
                  >
                    {open === n.id ? '해당 매물 감추기' : `해당 매물 보기 (${n.items.length})`}
                  </button>
                  {open === n.id && (
                    <ul className="adm-notice-items">
                      {n.items.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            <div className="adm-notice-actions">
              {n.tab && (
                <button type="button" className="btn btn-navy" onClick={() => onGo(n.tab)}>
                  바로가기
                </button>
              )}
              <button type="button" className="adm-notice-x" onClick={() => dismiss(n.id)} aria-label="이 알림 숨기기">
                숨기기
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
