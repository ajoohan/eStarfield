import { useEffect } from 'react'
import { propertyTypes, company } from '../data.js'
import { dealLabel, priceLabel } from '../lib/format.js'

export default function ListingModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [item, onClose])

  if (!item) return null
  const typeLabel = propertyTypes.find((t) => t.key === item.typeKey)?.label ?? ''
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="닫기">×</button>
        <span className="tag">{dealLabel(item.dealKey)} · {typeLabel}</span>
        <h3>{item.title}</h3>
        <p className="modal-price">{priceLabel(item)}</p>
        <ul className="modal-spec">
          <li><span>위치</span>{item.location}</li>
          <li><span>면적</span>{item.area}</li>
          <li><span>층</span>{item.floor}</li>
        </ul>
        <p className="modal-desc">{item.desc}</p>
        <a className="btn btn-gold" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 이 매물 문의 {company.phone}</a>
      </div>
    </div>
  )
}
