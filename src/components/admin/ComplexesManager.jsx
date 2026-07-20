import { useEffect, useState } from 'react'
import { adminClient } from '../../lib/amplifyClient.js'
import { uploadPublicImage, resolveFileUrl } from '../../lib/storage.js'

const emptyForm = {
  name: '',
  category: '',
  description: '',
  tags: '',
  sortOrder: 0,
  isActive: true,
}

function tagsToText(tags) {
  return Array.isArray(tags) ? tags.filter(Boolean).join(', ') : ''
}

function textToTags(text) {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export default function ComplexesManager() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageRaw, setImageRaw] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)

  async function loadRows() {
    setLoading(true)
    setError('')
    try {
      const { data, errors } = await adminClient.models.Complex.list({ limit: 500 })
      if (errors?.length) {
        setError(errors[0]?.message || '단지 목록을 불러오지 못했습니다.')
        setRows([])
      } else {
        const mapped = await Promise.all(
          [...(data || [])]
            .sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0))
            .map(async (r) => ({ ...r, imageUrl: await resolveFileUrl(r.image || '') })),
        )
        setRows(mapped)
      }
    } catch (err) {
      setError(err?.message || '단지 목록을 불러오는 중 오류가 발생했습니다.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [])

  function openNewForm() {
    setEditingId(null)
    setForm(emptyForm)
    setImageRaw('')
    setImageUrl('')
    setImageFile(null)
    setShowForm(true)
    setError('')
  }

  function openEditForm(row) {
    setEditingId(row.id)
    setForm({
      name: row.name || '',
      category: row.category || '',
      description: row.description || '',
      tags: tagsToText(row.tags),
      sortOrder: row.sortOrder ?? 0,
      isActive: row.isActive ?? true,
    })
    setImageRaw(row.image || '')
    setImageUrl(row.imageUrl || row.image || '')
    setImageFile(null)
    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setImageRaw('')
    setImageUrl('')
    setImageFile(null)
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let image = imageRaw
      if (imageFile) {
        image = await uploadPublicImage(imageFile, 'complexes')
      }

      const payload = {
        image,
        name: form.name,
        category: form.category,
        description: form.description,
        tags: textToTags(form.tags),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      }

      let result
      if (editingId) {
        result = await adminClient.models.Complex.update({ id: editingId, ...payload })
      } else {
        result = await adminClient.models.Complex.create(payload)
      }
      if (result.errors?.length) {
        setError(result.errors[0]?.message || '저장에 실패했습니다.')
        return
      }

      closeForm()
      await loadRows()
    } catch (err) {
      setError(err?.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row) {
    if (!confirm(`"${row.name}" 단지를 삭제하시겠습니까?`)) return
    setError('')
    try {
      const { errors } = await adminClient.models.Complex.delete({ id: row.id })
      if (errors?.length) {
        setError(errors[0]?.message || '삭제에 실패했습니다.')
        return
      }
      await loadRows()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <h2>주변단지소개 관리</h2>
        <button type="button" className="btn btn-navy" onClick={openNewForm}>
          + 단지 추가
        </button>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {showForm && (
        <form className="adm-form" onSubmit={handleSubmit}>
          <h3>{editingId ? '단지 수정' : '단지 추가'}</h3>
          <div className="adm-form-grid">
            <label className="adm-field">
              단지명 *
              <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label className="adm-field">
              분류
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="예: 아파트 · 단지내 상가"
              />
            </label>
            <label className="adm-field">
              정렬순서
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField('sortOrder', e.target.value)}
              />
            </label>
          </div>
          <label className="adm-field">
            설명
            <textarea rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
          </label>
          <label className="adm-field">
            태그 (쉼표로 구분)
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              placeholder="예: 대단지, 학군 — '본사무소' 태그를 넣으면 강조 표시됩니다"
            />
          </label>
          <div className="adm-field">
            대표 이미지
            <div className="adm-img-row">
              {(imageFile || imageUrl) && (
                <img
                  className="adm-img-preview"
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                  alt="대표 이미지 미리보기"
                />
              )}
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {(imageFile || imageUrl) && (
                <button
                  type="button"
                  className="btn btn-ghost-navy adm-img-remove"
                  onClick={() => {
                    setImageFile(null)
                    setImageUrl('')
                    setImageRaw('')
                  }}
                >
                  이미지 제거
                </button>
              )}
            </div>
          </div>
          <label className="adm-field adm-check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
            />
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
      ) : rows.length === 0 ? (
        <p className="adm-empty">등록된 단지가 없습니다.</p>
      ) : (
        <ul className="adm-list">
          {rows.map((row) => (
            <li key={row.id} className="adm-list-item adm-thumb-item">
              <div className="adm-thumb">
                {row.imageUrl ? <img src={row.imageUrl} alt="" /> : <span>NO IMAGE</span>}
              </div>
              <div className="adm-thumb-body">
                <div className="adm-list-main">
                  <strong>{row.name}</strong>
                  <span className={`adm-badge ${row.isActive ? 'adm-badge-on' : 'adm-badge-off'}`}>
                    {row.isActive ? '공개' : '비공개'}
                  </span>
                </div>
                <p className="adm-list-meta">
                  {row.category || '분류 없음'} · 태그 {tagsToText(row.tags) || '-'} · 정렬 {row.sortOrder}
                </p>
                <div className="adm-list-actions">
                  <button type="button" className="btn btn-ghost-navy" onClick={() => openEditForm(row)}>
                    수정
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(row)}>
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
