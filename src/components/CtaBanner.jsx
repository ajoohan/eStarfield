import { Link } from 'react-router-dom'
import { company } from '../data.js'

export default function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="container cta-inner">
        <div>
          <h3>매물 문의는 전화가 가장 빠릅니다</h3>
          <p>{company.region} 상가·사무실·아파트·토지, 조건만 알려주시면 맞는 매물을 찾아드립니다.</p>
        </div>
        <div className="cta-actions">
          <a className="btn btn-gold" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 {company.phone}</a>
          <Link className="btn btn-ghost" to="/contact">온라인 문의</Link>
        </div>
      </div>
    </section>
  )
}
