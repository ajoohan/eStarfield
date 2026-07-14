import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { company, useMethods } from '../data.js'
import { fetchListings } from '../lib/listingsApi.js'
import SectionTitle from '../components/SectionTitle.jsx'
import PropertyTypeCards from '../components/PropertyTypeCards.jsx'
import StepGuide from '../components/StepGuide.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import { dealLabel } from '../lib/format.js'

export default function Home() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchListings().then((data) => {
      if (cancelled) return
      setItems(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const featured = items.slice(0, 4)
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-eyebrow">하남 미사 · 유니온시티 부동산</span>
          <h1>딱 맞는 매물,<br /><b>하남 e스타필드</b>가 빠르게 찾아드립니다</h1>
          <p>상가·사무실·아파트·토지까지. 현장 확인한 매물만, 지역 밀착 전문가가 안내합니다.</p>
          <div className="hero-actions">
            <a className="btn btn-gold" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 {company.phone}</a>
            <Link className="btn btn-navy" to="/listings">매물 보러가기</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="PROPERTY" title="어떤 매물을 찾으세요?" sub="유형을 선택하면 관련 매물로 이동합니다." />
          <PropertyTypeCards />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle eyebrow="HOW IT WORKS" title="이용 방법" sub="편한 방법으로 시작하세요." />
          <StepGuide items={useMethods} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="FEATURED" title="추천 매물" sub="현재 상담 가능한 대표 매물입니다." />
          <div className="feat-grid">
            {featured.map((l) => (
              <div key={l.id} className="feat-card">
                <div className="feat-thumb">
                  {l.thumb ? <img src={l.thumb} alt={l.title} loading="lazy" /> : l.title.slice(0, 1)}
                </div>
                <div className="feat-body">
                  <span className="tag">{dealLabel(l.dealKey)}</span>
                  <strong>{l.title}</strong>
                  <p>{l.location} · {l.area}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="center-mt"><Link className="btn btn-navy" to="/listings">전체 매물 보기</Link></div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
