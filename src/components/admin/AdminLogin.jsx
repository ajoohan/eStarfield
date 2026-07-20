import { useState } from 'react'
import { signIn, confirmSignIn } from 'aws-amplify/auth'

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
  // Cognito 최초 로그인(임시 비밀번호) 시 새 비밀번호 설정 단계
  const [needNewPassword, setNeedNewPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  function rememberEmail() {
    try {
      if (remember) localStorage.setItem(SAVED_EMAIL_KEY, email)
      else localStorage.removeItem(SAVED_EMAIL_KEY)
    } catch {
      // localStorage 사용 불가 환경은 무시
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password })
      if (isSignedIn) {
        rememberEmail()
        return // Hub 리스너가 부모(Admin.jsx) 세션을 갱신한다.
      }
      if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNeedNewPassword(true)
        return
      }
      setError('로그인을 완료할 수 없습니다. 관리자에게 문의하세요.')
    } catch (err) {
      setError(err?.message || '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNewPassword(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword })
      if (isSignedIn) rememberEmail()
      else setError('비밀번호 설정을 완료할 수 없습니다.')
    } catch (err) {
      setError(err?.message || '비밀번호 설정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (needNewPassword) {
    return (
      <div className="adm-login-wrap">
        <form className="adm-login-card" onSubmit={handleNewPassword}>
          <h1 className="adm-login-title">
            <span className="adm-login-logo">
              <b className="adm-login-e">e</b>스타필드
            </span>
            <span className="adm-login-badge">관리자</span>
          </h1>
          <p className="adm-login-sub">최초 로그인입니다. 사용할 새 비밀번호를 설정하세요.</p>
          <label className="adm-field">
            새 비밀번호
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {error && <p className="adm-error">{error}</p>}
          <button type="submit" className="btn btn-navy adm-login-btn" disabled={submitting}>
            {submitting ? '설정 중…' : '비밀번호 설정 후 로그인'}
          </button>
        </form>
      </div>
    )
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
