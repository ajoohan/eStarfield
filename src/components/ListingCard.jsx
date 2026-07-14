import { propertyTypes } from '../data.js'
import { dealLabel, priceLabel } from '../lib/format.js'

export default function ListingCard({ item, onClick }) {
  const typeLabel = propertyTypes.find((t) => t.key === item.typeKey)?.label ?? ''
  return (
    <button className="lc" onClick={() => onClick(item)}>
      <div className="lc-thumb">
        {item.thumb ? <img src={item.thumb} alt={item.title} loading="lazy" /> : <span>{typeLabel}</span>}
      </div>
      <div className="lc-body">
        <span className="tag">{dealLabel(item.dealKey)}</span>
        <strong>{item.title}</strong>
        <p className="lc-price">{priceLabel(item)}</p>
        <p className="lc-meta">{item.location} · {item.area} · {item.floor}</p>
      </div>
    </button>
  )
}
