import { company } from '../data.js'
import { PhoneIcon } from './icons.jsx'

/**
 * 매물을 불러오지 못했을 때 보여주는 안내.
 * 존재하지 않는 예시 매물을 대신 노출하지 않기 위해 명시적으로 안내한다.
 */
export default function LoadErrorBox() {
  return (
    <div className="load-error">
      <strong>매물 정보를 불러오지 못했습니다.</strong>
      <p>
        일시적인 문제일 수 있습니다. 잠시 후 새로고침해 주세요.
        <br />
        급하시면 전화로 문의해 주시면 바로 안내해 드립니다.
      </p>
      <a className="btn btn-navy" href={`tel:${company.phone.replace(/-/g, '')}`}>
        <PhoneIcon className="btn-ico" /> {company.phone}
      </a>
    </div>
  )
}
