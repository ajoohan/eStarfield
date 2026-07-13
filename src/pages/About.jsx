import { company, greeting } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function About() {
  return (
    <>
      <div className="page">
        <SectionTitle eyebrow="ABOUT" title="회사소개" sub={`${company.region} 지역 밀착 부동산 파트너`} />

        <section className="about-greet">
          {greeting.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="about-sign">{company.name}&nbsp;&nbsp;대표 {company.ceo}</p>
        </section>

        <section className="about-info">
          <h3>사무소 정보</h3>
          <ul>
            <li><span>상호</span>{company.name}</li>
            <li><span>위치</span>{company.addressDetail}</li>
            <li><span>주소</span>{company.address}</li>
            <li><span>대표(공인중개사)</span>{company.ceo}</li>
            <li><span>전화</span><a href={`tel:${company.phone.replace(/-/g, '')}`}>{company.phone}</a></li>
            <li><span>휴대폰</span>{company.mobiles.join(' / ')}</li>
            <li><span>팩스</span>{company.fax}</li>
            <li><span>이메일</span>{company.email}</li>
            <li><span>등록번호</span>{company.brokerLicense}</li>
            <li><span>사업자등록번호</span>{company.bizNumber}</li>
            <li><span>영업시간</span>{company.hours}</li>
          </ul>
        </section>
      </div>
      <CtaBanner />
    </>
  )
}
