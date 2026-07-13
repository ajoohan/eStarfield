import { steps } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import StepGuide from '../components/StepGuide.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function Process() {
  return (
    <>
      <div className="page">
        <SectionTitle eyebrow="PROCESS" title="계약절차안내" sub="매물 확인부터 입주까지, 이렇게 진행됩니다." />
        <StepGuide items={steps} />
        <div className="proc-note">
          <h3>준비하면 좋은 서류</h3>
          <ul>
            <li>매수·임차: 신분증, 계약금(계좌이체 준비), 도장</li>
            <li>매도·임대: 신분증, 등기권리증, 도장, (해당 시) 위임장·인감증명</li>
          </ul>
          <p className="proc-caution">※ 계약 전 등기부등본·중개대상물 확인·설명서를 반드시 확인하세요. 세부 절차는 매물 상황에 따라 달라질 수 있습니다.</p>
        </div>
      </div>
      <CtaBanner />
    </>
  )
}
