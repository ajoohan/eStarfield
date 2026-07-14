import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const emptyForm = {
  name: '',
  category: '',
  description: '',
  tags: '',
  sort_order: 0,
  is_active: true,
}

function tagsToText(tags) {
  return Array.isArray(tags) ? tags.join(', ') : ''
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

  async function loadRows() {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('complexes')
        .select('*')
        .order('sort_order', { ascending: true })
      if (fetchError) {
        setError(fetchError.message || '단지 목록을 불러오지 못했습니다.')
        setRows([])
      } else {
        setRows(data || [])
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
      sort_order: row.sort_order ?? 0,
      is_active: row.is_active ?? true,
    })
    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        tags: textToTags(form.tags),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      }

      let result
      if (editingId) {
        result = await supabase.from('complexes').update(payload).eq('id', editingId)
      } else {
        result = await supabase.from('complexes').insert(payload)
      }
      if (result.error) {
        setError(result.error.message || '저장에 실패했습니다.')
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
      const { error: deleteError } = await supabase.from('complexes').delete().eq('id', row.id)
      if (deleteError) {
        setError(deleteError.message || '삭제에 실패했습니다.')
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
                value={form.sort_order}
                onChange={(e) => updateField('sort_order', e.target.value)}
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
          <label className="adm-field adm-check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
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
        <p className="adm-empty">등록된 단지가 없습니다. (Supabase에 schema.sql을 실행했는지 확인하세요)</p>
      ) : (
        <ul className="adm-list">
          {rows.map((row) => (
            <li key={row.id} className="adm-list-item">
              <div className="adm-list-main">
                <strong>{row.name}</strong>
                <span className={`adm-badge ${row.is_active ? 'adm-badge-on' : 'adm-badge-off'}`}>
                  {row.is_active ? '공개' : '비공개'}
                </span>
              </div>
              <p className="adm-list-meta">
                {row.category || '분류 없음'} · 태그 {tagsToText(row.tags) || '-'} · 정렬 {row.sort_order}
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
