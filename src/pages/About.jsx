import { company } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function About() {
  return (
    <>
      <div className="page">
        <SectionTitle eyebrow="ABOUT" title="회사소개" sub={`${company.region} 지역 밀착 부동산 파트너`} />
        <div className="about-greet">
          <p>안녕하세요, <b>{company.name}</b>입니다.</p>
          <p>저희는 {company.region} 권역의 상가·사무실·아파트·토지 거래를 전문으로 하는 공인중개사무소입니다.
          에일린의뜰 단지 내에 자리해 지역 매물과 시세를 가장 가까이에서 파악하고, 현장 확인을 거친 매물만 정직하게 안내합니다.</p>
          <p>작은 원룸 임대부터 상가건물 통매매까지, 고객의 상황에 맞는 최선의 거래를 함께 찾겠습니다.</p>
        </div>
        <div className="about-info">
          <h3>사무소 정보</h3>
          <ul>
            <li><span>상호</span>{company.name}</li>
            <li><span>대표</span>{company.ceo}</li>
            <li><span>주소</span>{company.address}</li>
            <li><span>전화</span>{company.phone}</li>
            <li><span>이메일</span>{company.email}</li>
            <li><span>중개등록</span>{company.brokerLicense}</li>
            <li><span>영업시간</span>{company.hours}</li>
          </ul>
        </div>
        <div className="about-points">
          <div className="pt"><strong>지역 밀착</strong><p>단지 내 위치, 실시간 시세·매물 파악</p></div>
          <div className="pt"><strong>정직한 매물</strong><p>현장 확인·권리관계 점검을 거친 매물만</p></div>
          <div className="pt"><strong>끝까지 책임</strong><p>계약부터 잔금·입주까지 안전하게</p></div>
        </div>
      </div>
      <CtaBanner />
    </>
  )
}
