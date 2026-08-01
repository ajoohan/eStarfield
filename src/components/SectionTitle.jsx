import { mbr } from './Mbr.jsx'

export default function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div className="sec-title">
      {eyebrow && <span className="sec-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {sub && <p>{mbr(sub)}</p>}
    </div>
  )
}
