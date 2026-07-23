import { useEffect, useRef, useState } from 'react'
import { remove as removeFile } from 'aws-amplify/storage'
import { adminClient } from '../../lib/amplifyClient.js'
import { uploadPublicFile } from '../../lib/storage.js'
import { boardsMeta } from '../../data.js'
import { formatPostDate } from '../../lib/postsApi.js'

const emptyForm = {
  category: '',
  title: '',
  content: '',
  isActive: true,
}

function parseAttachments(raw) {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function PostsManager({ board }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [attachments, setAttachments] = useState([]) // 유지되는 기존 첨부 [{name,path,size}]
  const [originalPaths, setOriginalPaths] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  async function loadPosts() {
    setLoading(true)
    setError('')
    try {
      const { data, errors } = await adminClient.models.Post.list({
        filter: { board: { eq: board } },
        limit: 500,
      })
      if (errors?.length) {
        setError(errors[0]?.message || '게시물 목록을 불러오지 못했습니다.')
        setPosts([])
      } else {
        const rows = (data || [])
          .map((r) => ({ ...r, attachments: parseAttachments(r.attachments) }))
          .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
        setPosts(rows)
      }
    } catch (err) {
      setError(err?.message || '게시물 목록을 불러오는 중 오류가 발생했습니다.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
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
      content: row.content || '',
      isActive: row.isActive ?? true,
    })
    const existing = parseAttachments(row.attachments)
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
      // 1) 새 파일 업로드 (S3)
      const uploaded = []
      for (const f of newFiles) {
        uploaded.push(await uploadPublicFile(f, 'posts'))
      }

      const finalAttachments = [...attachments, ...uploaded]
      const payload = {
        board,
        ...form,
        attachments: JSON.stringify(finalAttachments),
      }

      let result
      if (editingId) {
        result = await adminClient.models.Post.update({ id: editingId, ...payload })
      } else {
        result = await adminClient.models.Post.create(payload)
      }
      if (result.errors?.length) {
        setError(result.errors[0]?.message || '저장에 실패했습니다.')
        return
      }

      // 2) 수정에서 제거된 기존 첨부는 S3에서도 삭제(베스트 에포트)
      const keptPaths = new Set(finalAttachments.map((f) => f.path))
      const removedPaths = originalPaths.filter((p) => !keptPaths.has(p))
      for (const p of removedPaths) {
        try {
          await removeFile({ path: p })
        } catch {
          // 무시
        }
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
      const { errors } = await adminClient.models.Post.delete({ id: row.id })
      if (errors?.length) {
        setError(errors[0]?.message || '삭제에 실패했습니다.')
        return
      }
      for (const f of parseAttachments(row.attachments)) {
        try {
          await removeFile({ path: f.path })
        } catch {
          // 무시
        }
      }
      await loadPosts()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <h2>{boardsMeta[board].label} 관리</h2>
        <button type="button" className="btn btn-navy" onClick={openNewForm}>
          + 게시물 등록
        </button>
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
          </div>

          <label className="adm-field">
            본문 내용
            <textarea rows={7} value={form.content} onChange={(e) => updateField('content', e.target.value)} />
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
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} />
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
        <p className="adm-empty">등록된 게시물이 없습니다.</p>
      ) : (
        <ul className="adm-list">
          {posts.map((row) => (
            <li key={row.id} className="adm-list-item">
              <div className="adm-list-main">
                <strong>{row.title}</strong>
                <span className={`adm-badge ${row.isActive ? 'adm-badge-on' : 'adm-badge-off'}`}>
                  {row.isActive ? '공개' : '비공개'}
                </span>
              </div>
              <p className="adm-list-meta">
                {boardsMeta[board].label} · {row.category || '분야 없음'} · 조회 {row.views ?? 0} · 첨부{' '}
                {(row.attachments || []).length}건 · {formatPostDate(row.updatedAt || row.createdAt)}
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
