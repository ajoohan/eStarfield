import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

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

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function loadInquiries() {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchError) {
        setError(fetchError.message || '문의 목록을 불러오지 못했습니다.')
        setInquiries([])
      } else {
        setInquiries(data || [])
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
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({ handled: !row.handled })
        .eq('id', row.id)
      if (updateError) {
        setError(updateError.message || '상태 변경에 실패했습니다.')
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
    setError('')
    try {
      const { error: deleteError } = await supabase.from('inquiries').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message || '삭제에 실패했습니다.')
        return
      }
      await loadInquiries()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
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
                  <td>{row.phone}</td>
                  <td>{row.kind}</td>
                  <td className="adm-table-msg">{row.message}</td>
                  <td>
                    <span className={`adm-badge ${row.handled ? 'adm-badge-on' : 'adm-badge-off'}`}>
                      {row.handled ? '처리완료' : '미처리'}
                    </span>
                  </td>
                  <td className="adm-table-actions">
                    <button
                      type="button"
                      className="btn btn-ghost-navy"
                      onClick={() => toggleHandled(row)}
                      disabled={busyId === row.id}
                    >
                      {row.handled ? '처리취소' : '처리완료'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(row.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
