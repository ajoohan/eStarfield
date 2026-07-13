import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase.js'
import AdminLogin from '../components/admin/AdminLogin.jsx'
import ListingsManager from '../components/admin/ListingsManager.jsx'
import InquiriesManager from '../components/admin/InquiriesManager.jsx'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [tab, setTab] = useState('listings')
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
    <div className="adm-shell">
      <header className="adm-topbar">
        <h1>e스타필드 관리자</h1>
        <button type="button" className="btn btn-ghost-navy" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? '로그아웃 중…' : '로그아웃'}
        </button>
      </header>

      <nav className="adm-tabs">
        <button
          type="button"
          className={tab === 'listings' ? 'adm-tab is-active' : 'adm-tab'}
          onClick={() => setTab('listings')}
        >
          매물관리
        </button>
        <button
          type="button"
          className={tab === 'inquiries' ? 'adm-tab is-active' : 'adm-tab'}
          onClick={() => setTab('inquiries')}
        >
          문의함
        </button>
      </nav>

      <main className="adm-content">
        {tab === 'listings' ? <ListingsManager /> : <InquiriesManager />}
      </main>
    </div>
  )
}
