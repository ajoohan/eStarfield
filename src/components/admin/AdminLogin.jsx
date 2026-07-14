import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const SAVED_EMAIL_KEY = 'estarfield_admin_saved_email'

function getSavedEmail() {
  try {
    return localStorage.getItem(SAVED_EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState(getSavedEmail)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(getSavedEmail()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message || '로그인에 실패했습니다.')
        return
      }
      // 로그인 성공 시에만 아이디 저장/삭제
      try {
        if (remember) localStorage.setItem(SAVED_EMAIL_KEY, email)
        else localStorage.removeItem(SAVED_EMAIL_KEY)
      } catch {
        // localStorage 사용 불가 환경은 무시
      }
      // 성공 시 onAuthStateChange 구독이 부모(Admin.jsx)의 세션 상태를 갱신한다.
    } catch (err) {
      setError(err?.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="adm-login-wrap">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <h1 className="adm-login-title">
          <span className="adm-login-logo">
            <b className="adm-login-e">e</b>스타필드
          </span>
          <span className="adm-login-badge">관리자</span>
        </h1>
        <p className="adm-login-sub">관리자 계정으로 로그인하세요.</p>
        <label className="adm-field">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="adm-field">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="adm-field adm-check adm-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          아이디 저장
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button type="submit" className="btn btn-navy adm-login-btn" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </div>
  )
}
