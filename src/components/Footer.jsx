import { company } from '../data.js'

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="container ftr-inner">
        <div className="ftr-brand">
          <strong>{company.name}</strong>
          <p>{company.region} 상가·사무실·아파트·토지 전문</p>
        </div>
        <div className="ftr-info">
          <p>대표 {company.ceo} · 중개등록 {company.brokerLicense}</p>
          <p>{company.address}</p>
          <p>전화 {company.phone} · {company.email}</p>
          <p>{company.hours}</p>
        </div>
        <div className="ftr-copy">© 2026 {company.name}. All rights reserved.</div>
      </div>
    </footer>
  )
}
