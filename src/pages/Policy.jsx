import { useState } from 'react'
import { feeTable, faqs } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function Policy() {
  const [open, setOpen] = useState(0)
  return (
    <>
      <div className="page">
        <SectionTitle eyebrow="POLICY" title="부동산정책" sub="중개보수 요율과 자주 묻는 질문을 안내합니다." />
        <h3 className="policy-h">중개보수(수수료) 안내</h3>
        <div className="fee-wrap">
          <table className="fee-table">
            <thead><tr><th>구분</th><th>적용</th><th>요율</th><th>비고</th></tr></thead>
            <tbody>
              {feeTable.map((f, i) => (
                <tr key={i}><td>{f.category}</td><td>{f.range}</td><td className="fee-rate">{f.rate}</td><td>{f.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="policy-caution">※ 위 요율은 일반 안내값입니다. 실제 중개보수는 거래금액·유형에 따라 법정 한도 내에서 상호 협의로 결정됩니다.</p>

        <h3 className="policy-h">자주 묻는 질문</h3>
        <div className="faq">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? 'on' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}<span>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
      <CtaBanner />
    </>
  )
}
