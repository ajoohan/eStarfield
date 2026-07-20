import { useEffect, useState } from 'react'
import { adminClient } from '../../lib/amplifyClient.js'
import { uploadPublicImage, resolveFileUrl } from '../../lib/storage.js'
import { propertyTypes, dealTypes } from '../../data.js'

const emptyForm = {
  title: '',
  typeKey: propertyTypes[0].key,
  dealKey: dealTypes[0].key,
  area: '',
  price: '',
  deposit: '',
  monthly: '',
  location: '',
  floor: '',
  description: '',
  isActive: true,
  sortOrder: 0,
}

function typeLabel(key) {
  return propertyTypes.find((t) => t.key === key)?.label || key
}
function dealLabel(key) {
  return dealTypes.find((d) => d.key === key)?.label || key
}

export default function ListingsManager() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageRaw, setImageRaw] = useState('') // 저장돼 있는 원래 값(S3 경로 등)
  const [imageUrl, setImageUrl] = useState('') // 미리보기용 URL
  const [imageFile, setImageFile] = useState(null)

  async function loadListings() {
    setLoading(true)
    setError('')
    try {
      const { data, errors } = await adminClient.models.Listing.list({ limit: 500 })
      if (errors?.length) {
        setError(errors[0]?.message || '매물 목록을 불러오지 못했습니다.')
        setListings([])
      } else {
        const rows = await Promise.all(
          [...(data || [])]
            .sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0))
            .map(async (r) => ({ ...r, thumbUrl: await resolveFileUrl(r.thumb || '') })),
        )
        setListings(rows)
      }
    } catch (err) {
      setError(err?.message || '매물 목록을 불러오는 중 오류가 발생했습니다.')
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
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
      title: row.title || '',
      typeKey: row.typeKey || propertyTypes[0].key,
      dealKey: row.dealKey || dealTypes[0].key,
      area: row.area || '',
      price: row.price || '',
      deposit: row.deposit || '',
      monthly: row.monthly || '',
      location: row.location || '',
      floor: row.floor || '',
      description: row.description || '',
      isActive: row.isActive ?? true,
      sortOrder: row.sortOrder ?? 0,
    })
    setImageRaw(row.thumb || '')
    setImageUrl(row.thumbUrl || row.thumb || '')
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
      let thumb = imageRaw
      if (imageFile) {
        thumb = await uploadPublicImage(imageFile, 'listings')
      }

      const payload = {
        thumb,
        title: form.title,
        typeKey: form.typeKey,
        dealKey: form.dealKey,
        area: form.area,
        price: form.price,
        deposit: form.deposit,
        monthly: form.monthly,
        location: form.location,
        floor: form.floor,
        description: form.description,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      }

      let result
      if (editingId) {
        result = await adminClient.models.Listing.update({ id: editingId, ...payload })
      } else {
        result = await adminClient.models.Listing.create(payload)
      }
      if (result.errors?.length) {
        setError(result.errors[0]?.message || '저장에 실패했습니다.')
        return
      }

      closeForm()
      await loadListings()
    } catch (err) {
      setError(err?.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('이 매물을 삭제하시겠습니까?')) return
    setError('')
    try {
      const { errors } = await adminClient.models.Listing.delete({ id })
      if (errors?.length) {
        setError(errors[0]?.message || '삭제에 실패했습니다.')
        return
      }
      await loadListings()
    } catch (err) {
      setError(err?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <h2>매물 관리</h2>
        <button type="button" className="btn btn-navy" onClick={openNewForm}>
          + 매물 추가
        </button>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {showForm && (
        <form className="adm-form" onSubmit={handleSubmit}>
          <h3>{editingId ? '매물 수정' : '매물 추가'}</h3>
          <div className="adm-form-grid">
            <label className="adm-field">
              제목
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </label>
            <label className="adm-field">
              유형
              <select value={form.typeKey} onChange={(e) => updateField('typeKey', e.target.value)}>
                {propertyTypes.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              거래유형
              <select value={form.dealKey} onChange={(e) => updateField('dealKey', e.target.value)}>
                {dealTypes.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              면적
              <input type="text" value={form.area} onChange={(e) => updateField('area', e.target.value)} />
            </label>
            <label className="adm-field">
              매매가
              <input type="text" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
            </label>
            <label className="adm-field">
              보증금
              <input type="text" value={form.deposit} onChange={(e) => updateField('deposit', e.target.value)} />
            </label>
            <label className="adm-field">
              월세
              <input type="text" value={form.monthly} onChange={(e) => updateField('monthly', e.target.value)} />
            </label>
            <label className="adm-field">
              위치
              <input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
            </label>
            <label className="adm-field">
              층
              <input type="text" value={form.floor} onChange={(e) => updateField('floor', e.target.value)} />
            </label>
            <label className="adm-field">
              정렬순서
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField('sortOrder', e.target.value)}
              />
            </label>
            <label className="adm-field adm-check">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
              />
              활성화(공개)
            </label>
          </div>
          <label className="adm-field">
            상세설명
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
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
      ) : listings.length === 0 ? (
        <p className="adm-empty">등록된 매물이 없습니다.</p>
      ) : (
        <ul className="adm-list">
          {listings.map((row) => (
            <li key={row.id} className="adm-list-item adm-thumb-item">
              <div className="adm-thumb">
                {row.thumbUrl ? <img src={row.thumbUrl} alt="" /> : <span>NO IMAGE</span>}
              </div>
              <div className="adm-thumb-body">
                <div className="adm-list-main">
                  <strong>{row.title}</strong>
                  <span className={`adm-badge ${row.isActive ? 'adm-badge-on' : 'adm-badge-off'}`}>
                    {row.isActive ? '공개' : '비공개'}
                  </span>
                </div>
                <p className="adm-list-meta">
                  {typeLabel(row.typeKey)} · {dealLabel(row.dealKey)} ·{' '}
                  {row.price || row.deposit || row.monthly || '-'} · {row.location}
                </p>
                <div className="adm-list-actions">
                  <button type="button" className="btn btn-ghost-navy" onClick={() => openEditForm(row)}>
                    수정
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(row.id)}>
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
