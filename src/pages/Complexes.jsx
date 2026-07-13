import { complexes, company } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function Complexes() {
  return (
    <>
      <div className="page">
        <SectionTitle eyebrow="NEARBY" title="주변단지소개" sub={`${company.region} 주요 단지와 생활권을 안내합니다.`} />

        <div className="cx-grid">
          {complexes.map((c) => {
            const isHq = c.tags.includes('본사무소')
            return (
              <div key={c.name} className={`cx-card${isHq ? ' cx-card-hq' : ''}`}>
                {isHq && <span className="cx-badge">본 사무소</span>}
                <span className="cx-category">{c.category}</span>
                <strong>{c.name}</strong>
                <p>{c.desc}</p>
                <div className="cx-tags">
                  {c.tags.map((tag) => (
                    <span key={tag} className="cx-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p className="cx-note">※ 단지 정보는 예시이며 실제와 다를 수 있습니다. 정확한 단지 정보·시세는 문의 바랍니다.</p>
      </div>
      <CtaBanner />
    </>
  )
}
