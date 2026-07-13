import { useState } from 'react'
import { company } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import { supabase, supabaseReady } from '../lib/supabase.js'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', kind: '매물 문의', message: '' })
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      if (!supabaseReady) throw new Error('Supabase not configured')
      const { error: insertError } = await supabase.from('inquiries').insert({
        name: form.name,
        phone: form.phone,
        kind: form.kind,
        message: form.message,
      })
      if (insertError) throw insertError
      setSent(true)
    } catch (err) {
      console.error('[contact] inquiry submit failed', err)
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <SectionTitle eyebrow="CONTACT" title="문의" sub="남겨주시면 확인 후 빠르게 연락드립니다." />
      <div className="contact-grid">
        <div className="contact-info">
          <h3>연락처</h3>
          <ul>
            <li><span>전화</span><a href={`tel:${company.phone.replace(/-/g, '')}`}>{company.phone}</a></li>
            <li><span>휴대폰</span>{company.mobiles.join(' / ')}</li>
            <li><span>팩스</span>{company.fax}</li>
            <li><span>이메일</span>{company.email}</li>
            <li><span>주소</span>{company.address}</li>
            <li><span>영업시간</span>{company.hours}</li>
          </ul>
          <a className="map-link" href={`https://map.naver.com/v5/search/${encodeURIComponent(company.address)}`} target="_blank" rel="noreferrer">🗺️ 네이버 지도에서 위치 보기</a>
        </div>
        <div className="contact-form">
          {sent ? (
            <div className="sent-box">
              <strong>문의가 접수되었습니다. 감사합니다!</strong>
              <p>확인 후 빠르게 연락드리겠습니다. 급하시면 {company.phone} 로 전화 주세요.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>이름<input name="name" value={form.name} onChange={change} required /></label>
              <label>연락처<input name="phone" value={form.phone} onChange={change} required placeholder="010-0000-0000" /></label>
              <label>문의유형
                <select name="kind" value={form.kind} onChange={change}>
                  <option>매물 문의</option><option>매물 내놓기</option><option>기타 상담</option>
                </select>
              </label>
              <label>문의내용<textarea name="message" value={form.message} onChange={change} rows={5} required /></label>
              <button className="btn btn-navy" type="submit" disabled={submitting}>{submitting ? '보내는 중…' : '문의 보내기'}</button>
              {error && (
                <p className="form-error">
                  문의 전송에 실패했습니다. 입력하신 내용은 그대로 남아있으니 다시 시도해 주시거나, 급하신 경우 전화 {company.phone} 로 문의 주세요.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
