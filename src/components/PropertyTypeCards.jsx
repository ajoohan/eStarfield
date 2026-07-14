import { Link } from 'react-router-dom'
import { propertyTypes } from '../data.js'
import TypeIcon from './TypeIcon.jsx'

export default function PropertyTypeCards() {
  return (
    <div className="type-grid">
      {propertyTypes.map((t) => (
        <Link key={t.key} to={`/listings?type=${t.key}`} className="type-card">
          <span className="type-icon">
            <TypeIcon type={t.key} />
          </span>
          <strong>{t.label}</strong>
          <p>{t.desc}</p>
        </Link>
      ))}
    </div>
  )
}
