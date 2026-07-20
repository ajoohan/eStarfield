import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { amplifyReady } from '../lib/amplifyClient.js'
import AdminLogin from '../components/admin/AdminLogin.jsx'
import ListingsManager from '../components/admin/ListingsManager.jsx'
import InquiriesManager from '../components/admin/InquiriesManager.jsx'
import PostsManager from '../components/admin/PostsManager.jsx'
import ComplexesManager from '../components/admin/ComplexesManager.jsx'

const ADMIN_VERSION = 'Version 1.0'
const ADMIN_VERSION_DATE = '2026.07.16'

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
    if (!amplifyReady) {
      setCheckingSession(false)
      return undefined
    }

    let mounted = true

    getCurrentUser()
      .then((user) => {
        if (mounted) {
          setSession(user)
          setCheckingSession(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
          setCheckingSession(false)
        }
      })

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        getCurrentUser()
          .then((user) => mounted && setSession(user))
          .catch(() => mounted && setSession(null))
      } else if (payload.event === 'signedOut') {
        if (mounted) setSession(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[admin] 로그아웃 중 오류:', e?.message || e)
    } finally {
      setSigningOut(false)
    }
  }

  if (!amplifyReady) {
    return (
      <div className="adm-shell">
        <div className="adm-config-error">
          <h1>관리자 페이지를 사용할 수 없습니다</h1>
          <p>
            백엔드 설정 파일(<code>amplify_outputs.json</code>)이 없습니다. 배포 환경에서는 자동
            생성되며, 로컬에서는 Amplify 콘솔에서 다운로드해 프로젝트 루트에 두세요.
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
