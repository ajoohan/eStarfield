import { useEffect, useState } from 'react'
import { adminClient } from '../../lib/amplifyClient.js'

function formatDate(value) {
  if (!value) return '-'
  try {
    const d = new Date(value)
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function telHref(phone) {
  return `tel:${String(phone || '').replace(/[^0-9+]/g, '')}`
}

function smsHref(phone, body) {
  const num = String(phone || '').replace(/[^0-9+]/g, '')
  return `sms:${num}?body=${encodeURIComponent(body || '')}`
}

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [savingReply, setSavingReply] = useState(false)

  async function loadInquiries() {
    setLoading(true)
    setError('')
    try {
      const { data, errors } = await adminClient.models.Inquiry.list({ limit: 500 })
      if (errors?.length) {
        setError(errors[0]?.message || '문의 목록을 불러오지 못했습니다.')
        setInquiries([])
      } else {
        const rows = (data || [])
          .map((r) => ({ ...r, created_at: r.createdAt, replied_at: r.repliedAt }))
          .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
        setInquiries(rows)
      }
    } catch (err) {
      setError(err?.message || '문의 목록을 불러오는 중 오류가 발생했습니다.')
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [])

  async function toggleHandled(row) {
    setBusyId(row.id)
    setError('')
    try {
      const { errors } = await adminClient.models.Inquiry.update({ id: row.id, handled: !row.handled })
      if (errors?.length) {
        setError(errors[0]?.message || '상태 변경에 실패했습니다.')
        return
      }
      await loadInquiries()
    } catch (err) {
      setError(err?.message || '상태 변경 중 오류가 발생했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id) {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return
    setBusyId(id)
    setError('')
    try {
      const { errors } = await adminClient.models.Inquiry.delete({ id })
      if (errors?.length) {
        setError(errors[0]?.message || '삭제에 실패했습니다.')
        return
      }
      await loadInquiries()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  function openReply(row) {
    setReplyTarget(row)
    setReplyText(row.reply || '')
    setError('')
  }

  function closeReply() {
    setReplyTarget(null)
    setReplyText('')
  }

  async function saveReply() {
    if (!replyTarget) return
    setSavingReply(true)
    setError('')
    try {
      const { errors } = await adminClient.models.Inquiry.update({
        id: replyTarget.id,
        reply: replyText,
        repliedAt: new Date().toISOString(),
        handled: true,
      })
      if (errors?.length) {
        setError(errors[0]?.message || '회신 저장에 실패했습니다.')
        return
      }
      closeReply()
      await loadInquiries()
    } catch (err) {
      setError(err?.message || '회신 저장 중 오류가 발생했습니다.')
    } finally {
      setSavingReply(false)
    }
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <h2>문의함</h2>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <p className="adm-loading">불러오는 중…</p>
      ) : inquiries.length === 0 ? (
        <p className="adm-empty">접수된 문의가 없습니다.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>접수일시</th>
                <th>이름</th>
                <th>연락처</th>
                <th>유형</th>
                <th>내용</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.created_at)}</td>
                  <td>{row.name}</td>
                  <td>
                    <a href={telHref(row.phone)}>{row.phone}</a>
                  </td>
                  <td>{row.kind}</td>
                  <td className="adm-table-msg">
                    {row.message}
                    {row.reply ? (
                      <span className="adm-reply-preview">↳ 회신: {row.reply}</span>
                    ) : null}
                  </td>
                  <td>
                    {row.replied_at ? (
                      <span className="adm-badge adm-badge-reply">회신완료</span>
                    ) : (
                      <span className={`adm-badge ${row.handled ? 'adm-badge-on' : 'adm-badge-off'}`}>
                        {row.handled ? '처리완료' : '미처리'}
                      </span>
                    )}
                  </td>
                  <td className="adm-table-actions">
                    <button
                      type="button"
                      className="btn btn-navy"
                      onClick={() => openReply(row)}
                      disabled={busyId === row.id}
                    >
                      회신
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost-navy"
                      onClick={() => toggleHandled(row)}
                      disabled={busyId === row.id}
                    >
                      {row.handled ? '처리취소' : '처리완료'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(row.id)}
                      disabled={busyId === row.id}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {replyTarget && (
        <div className="modal-overlay" onClick={closeReply}>
          <div className="modal adm-reply-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={closeReply} aria-label="닫기">
              ×
            </button>
            <h3>문의 회신</h3>
            <ul className="modal-spec">
              <li>
                <span>이름</span>
                {replyTarget.name}
              </li>
              <li>
                <span>연락처</span>
                {replyTarget.phone}
              </li>
              <li>
                <span>유형</span>
                {replyTarget.kind || '-'}
              </li>
            </ul>
            <p className="adm-reply-orig">{replyTarget.message}</p>

            <label className="adm-field">
              회신 내용
              <textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="고객에게 보낼 회신 내용을 작성하세요. 문자로 바로 발송할 수 있습니다."
              />
            </label>

            <div className="adm-reply-actions">
              <a className="btn btn-gold" href={smsHref(replyTarget.phone, replyText)}>
                문자로 보내기
              </a>
              <a className="btn btn-ghost-navy" href={telHref(replyTarget.phone)}>
                전화 걸기
              </a>
              <button className="btn btn-navy" type="button" onClick={saveReply} disabled={savingReply}>
                {savingReply ? '저장 중…' : '회신 저장'}
              </button>
            </div>
            <p className="demo-note">
              ‘문자로 보내기’는 휴대폰의 문자 앱을 열어 회신 내용을 자동 입력합니다(휴대폰에서 실제 발송).
              ‘회신 저장’은 회신 내용을 기록하고 처리완료로 표시합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
