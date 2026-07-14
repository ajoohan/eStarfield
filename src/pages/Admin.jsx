import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase.js'
import AdminLogin from '../components/admin/AdminLogin.jsx'
import ListingsManager from '../components/admin/ListingsManager.jsx'
import InquiriesManager from '../components/admin/InquiriesManager.jsx'
import PostsManager from '../components/admin/PostsManager.jsx'
import ComplexesManager from '../components/admin/ComplexesManager.jsx'

const ADMIN_VERSION = 'Version 0.9'
const ADMIN_VERSION_DATE = '2026.07.14'

const ADMIN_MENU = [
  { group: '컨텐츠 관리', items: [['complexes', '주변단지소개'], ['listings', '매물정보']] },
  { group: '정책 관리', items: [['process', '계약절차안내'], ['policy', '부동산정책']] },
  { group: '문의 관리', items: [['inquiries', '문의함']] },
]

export default function Admin() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [tab, setTab] = useState('complexes')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!supabaseReady) {
      setCheckingSession(false)
      return undefined
    }

    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data?.session ?? null)
          setCheckingSession(false)
        }
      })
      .catch(() => {
        if (mounted) setCheckingSession(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[admin] 로그아웃 중 오류:', error.message || error)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[admin] 로그아웃 중 오류:', e?.message || e)
    } finally {
      setSigningOut(false)
    }
  }

  if (!supabaseReady) {
    return (
      <div className="adm-shell">
        <div className="adm-config-error">
          <h1>관리자 페이지를 사용할 수 없습니다</h1>
          <p>
            Supabase 환경변수(<code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>)가
            설정되지 않았습니다. <code>.env</code> 파일을 확인해 주세요.
          </p>
        </div>
      </div>
    )
  }

  if (checkingSession) {
    return (
      <div className="adm-shell">
        <p className="adm-loading">세션 확인 중…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="adm-shell">
        <AdminLogin />
      </div>
    )
  }

  return (
    <div className="adm-layout">
      <aside className="adm-side">
        <div className="adm-side-brand">
          <span className="adm-side-logo">
            <b>e</b>스타필드
          </span>
          <span className="adm-side-admin">ADMIN</span>
        </div>

        <nav className="adm-side-nav">
          {ADMIN_MENU.map(({ group, items }) => (
            <div key={group} className="adm-side-group">
              <span className="adm-side-group-label">{group}</span>
              {items.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={tab === key ? 'is-active' : ''}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-side-foot">
          <button type="button" className="adm-side-logout" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? '로그아웃 중…' : '로그아웃'}
          </button>
          <p className="adm-side-ver">
            {ADMIN_VERSION}
            <br />
            {ADMIN_VERSION_DATE}
          </p>
        </div>
      </aside>

      <main className="adm-main">
        {tab === 'complexes' && <ComplexesManager />}
        {tab === 'listings' && <ListingsManager />}
        {tab === 'process' && <PostsManager key="process" board="process" />}
        {tab === 'policy' && <PostsManager key="policy" board="policy" />}
        {tab === 'inquiries' && <InquiriesManager />}
      </main>
    </div>
  )
}
