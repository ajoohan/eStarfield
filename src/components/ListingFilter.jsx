import { propertyTypes, dealTypes } from '../data.js'

export default function ListingFilter({ type, deal, onType, onDeal }) {
  return (
    <div className="lf">
      <div className="lf-row">
        <span className="lf-label">유형</span>
        <button className={type === 'all' ? 'on' : ''} onClick={() => onType('all')}>전체</button>
        {propertyTypes.map((t) => (
          <button key={t.key} className={type === t.key ? 'on' : ''} onClick={() => onType(t.key)}>{t.label}</button>
        ))}
      </div>
      <div className="lf-row">
        <span className="lf-label">거래</span>
        <button className={deal === 'all' ? 'on' : ''} onClick={() => onDeal('all')}>전체</button>
        {dealTypes.map((d) => (
          <button key={d.key} className={deal === d.key ? 'on' : ''} onClick={() => onDeal(d.key)}>{d.label}</button>
        ))}
      </div>
    </div>
  )
}
