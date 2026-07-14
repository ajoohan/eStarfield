import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { boardsMeta } from '../../data.js'
import { formatPostDate } from '../../lib/postsApi.js'

const emptyForm = {
  category: '',
  title: '',
  department: 'e스타필드 공인중개사사무소',
  phone: '031-793-9500',
  duration: '',
  fee: '',
  how_to_apply: '',
  required_docs: '',
  steps: '',
  related_law: '',
  etc_note: '',
  content: '',
  is_active: true,
}

const TEXTAREAS = [
  ['how_to_apply', '신청/접수방법'],
  ['required_docs', '구비서류'],
  ['steps', '처리절차'],
  ['related_law', '관계법령'],
  ['etc_note', '기타사항'],
]

function fileKeyFor(name) {
  const ext = (name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  return `posts/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export default function PostsManager() {
  const [board, setBoard] = useState('process')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [attachments, setAttachments] = useState([]) // 유지되는 기존 첨부 [{name,path,size}]
  const [originalPaths, setOriginalPaths] = useState([]) // 수정 시작 시점의 첨부 경로들
  const [newFiles, setNewFiles] = useState([]) // 새로 추가할 File[]
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  async function loadPosts(targetBoard = board) {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('board', targetBoard)
        .order('id', { ascending: false })
      if (fetchError) {
        setError(fetchError.message || '게시물 목록을 불러오지 못했습니다.')
        setPosts([])
      } else {
        setPosts(data || [])
      }
    } catch (err) {
      setError(err?.message || '게시물 목록을 불러오는 중 오류가 발생했습니다.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts(board)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board])

  function resetFormState() {
    setEditingId(null)
    setForm(emptyForm)
    setAttachments([])
    setOriginalPaths([])
    setNewFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openNewForm() {
    resetFormState()
    setShowForm(true)
    setError('')
  }

  function openEditForm(row) {
    setEditingId(row.id)
    setForm({
      category: row.category || '',
      title: row.title || '',
      department: row.department || '',
      phone: row.phone || '',
      duration: row.duration || '',
      fee: row.fee || '',
      how_to_apply: row.how_to_apply || '',
      required_docs: row.required_docs || '',
      steps: row.steps || '',
      related_law: row.related_law || '',
      etc_note: row.etc_note || '',
      content: row.content || '',
      is_active: row.is_active ?? true,
    })
    const existing = row.attachments || []
    setAttachments(existing)
    setOriginalPaths(existing.map((f) => f.path))
    setNewFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    resetFormState()
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleFilePick(e) {
    const picked = Array.from(e.target.files || [])
    if (picked.length) setNewFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // 1) 새 파일 업로드
      const uploaded = []
      for (const f of newFiles) {
        const key = fileKeyFor(f.name)
        const { error: upErr } = await supabase.storage.from('post-files').upload(key, f)
        if (upErr) {
          setError(`첨부파일 업로드 실패 (${f.name}): ${upErr.message}`)
          return
        }
        uploaded.push({ name: f.name, path: key, size: f.size })
      }

      const finalAttachments = [...attachments, ...uploaded]
      const payload = {
        board,
        ...form,
        attachments: finalAttachments,
        updated_at: new Date().toISOString(),
      }

      let result
      if (editingId) {
        result = await supabase.from('posts').update(payload).eq('id', editingId)
      } else {
        result = await supabase.from('posts').insert(payload)
      }
      if (result.error) {
        setError(result.error.message || '저장에 실패했습니다.')
        return
      }

      // 2) 수정에서 제거된 기존 첨부는 스토리지에서도 삭제(베스트 에포트)
      const keptPaths = new Set(finalAttachments.map((f) => f.path))
      const removedPaths = originalPaths.filter((p) => !keptPaths.has(p))
      if (removedPaths.length) {
        await supabase.storage.from('post-files').remove(removedPaths)
      }

      closeForm()
      await loadPosts()
    } catch (err) {
      setError(err?.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row) {
    if (!confirm(`"${row.title}" 게시물을 삭제하시겠습니까?`)) return
    setError('')
    try {
      const { error: deleteError } = await supabase.from('posts').delete().eq('id', row.id)
      if (deleteError) {
        setError(deleteError.message || '삭제에 실패했습니다.')
        return
      }
      const paths = (row.attachments || []).map((f) => f.path)
      if (paths.length) await supabase.storage.from('post-files').remove(paths)
      await loadPosts()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <h2>게시판 관리</h2>
        <div className="adm-board-actions">
          <select className="adm-board-select" value={board} onChange={(e) => { setShowForm(false); resetFormState(); setBoard(e.target.value) }}>
            {Object.entries(boardsMeta).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          <button type="button" className="btn btn-navy" onClick={openNewForm}>
            + 게시물 등록
          </button>
        </div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {showForm && (
        <form className="adm-form" onSubmit={handleSubmit}>
          <h3>{editingId ? '게시물 수정' : `게시물 등록 — ${boardsMeta[board].label}`}</h3>
          <div className="adm-form-grid">
            <label className="adm-field">
              분야
              <input type="text" value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="예: 매매 / 임대차 / 중개보수" />
            </label>
            <label className="adm-field">
              제목 *
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            </label>
            <label className="adm-field">
              담당부서
              <input type="text" value={form.department} onChange={(e) => updateField('department', e.target.value)} />
            </label>
            <label className="adm-field">
              전화번호
              <input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
            </label>
            <label className="adm-field">
              처리기간
              <input type="text" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} />
            </label>
            <label className="adm-field">
              수수료
              <input type="text" value={form.fee} onChange={(e) => updateField('fee', e.target.value)} />
            </label>
          </div>

          {TEXTAREAS.map(([key, label]) => (
            <label key={key} className="adm-field">
              {label}
              <textarea rows={2} value={form[key]} onChange={(e) => updateField(key, e.target.value)} />
            </label>
          ))}

          <label className="adm-field">
            본문 내용
            <textarea rows={5} value={form.content} onChange={(e) => updateField('content', e.target.value)} />
          </label>

          <div className="adm-field">
            서식파일(첨부)
            <div className="adm-files">
              {attachments.map((f) => (
                <span key={f.path} className="adm-file-chip">
                  📄 {f.name}
                  <button type="button" aria-label="첨부 제거" onClick={() => setAttachments((prev) => prev.filter((x) => x.path !== f.path))}>×</button>
                </span>
              ))}
              {newFiles.map((f, i) => (
                <span key={`${f.name}-${i}`} className="adm-file-chip adm-file-new">
                  📄 {f.name}
                  <button type="button" aria-label="첨부 제거" onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}>×</button>
                </span>
              ))}
              <input ref={fileInputRef} type="file" multiple onChange={handleFilePick} />
            </div>
          </div>

          <label className="adm-field adm-check">
            <input type="checkbox" checked={form.is_active} onChange={(e) => updateField('is_active', e.target.checked)} />
            활성화(공개)
          </label>

          <div className="adm-form-actions">
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
            <button type="button" className="btn btn-ghost-navy" onClick={closeForm} disabled={saving}>
              취소
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="adm-loading">불러오는 중…</p>
      ) : posts.length === 0 ? (
        <p className="adm-empty">등록된 게시물이 없습니다. (Supabase에 schema.sql을 실행했는지 확인하세요)</p>
      ) : (
        <ul className="adm-list">
          {posts.map((row) => (
            <li key={row.id} className="adm-list-item">
              <div className="adm-list-main">
                <strong>{row.title}</strong>
                <span className={`adm-badge ${row.is_active ? 'adm-badge-on' : 'adm-badge-off'}`}>
                  {row.is_active ? '공개' : '비공개'}
                </span>
              </div>
              <p className="adm-list-meta">
                {boardsMeta[board].label} · {row.category || '분야 없음'} · 조회 {row.views ?? 0} · 첨부{' '}
                {(row.attachments || []).length}건 · {formatPostDate(row.updated_at || row.created_at)}
              </p>
              <div className="adm-list-actions">
                <button type="button" className="btn btn-ghost-navy" onClick={() => openEditForm(row)}>
                  수정
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(row)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
