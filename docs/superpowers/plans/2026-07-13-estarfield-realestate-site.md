# e스타필드 공인중개사 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하남 e스타필드 공인중개사사무소의 브로슈어형 홈페이지(홈 + 5메뉴)를 Vite+React로 구축한다.

**Architecture:** Vite+React(JS) SPA, react-router-dom로 6개 라우트. 모든 콘텐츠/매물/회사정보는 `src/data.js` 단일 소스에 모으고, 페이지/컴포넌트는 props/import로 소비만 한다. 백엔드 없음(문의 폼은 데모). 스타일은 단일 전역 CSS + CSS 변수(네이비/골드 팔레트).

**Tech Stack:** Vite, React 18, react-router-dom v6, Pretendard(CDN), 순수 CSS(변수 기반).

## Global Constraints

- 상호(정확히): `e스타필드 공인중개사사무소`
- 확정 회사정보: 주소 `경기 하남시 하남유니온로 70-1 에일린의뜰 단지내 상가 110호`, 전화 `031-793-9500`
- 더미 회사정보(교체 대기): 대표자·이메일·중개등록번호·사업자등록번호 → 값 끝에 `(변경예정)` 표기
- 취급 매물 유형: 상가/점포, 사무실/오피스, 아파트/주택, 토지/건물
- 취급 지역: 하남 미사·유니온시티 권역
- 색상: Navy `#0F2A4A` / Navy-deep `#0A1E38` / Gold `#C9A24B` / Gold-light `#E4C877` / bg `#F7F8FA` / text `#1B2430` / muted `#6B7684`
- 폰트: Pretendard
- 라우트: `/`, `/about`, `/listings`, `/process`, `/policy`, `/contact`
- 데이터 단일 소스: `src/data.js`
- 반응형(모바일 우선), 상단 고정 헤더, 전화 CTA 상시 노출

---

### Task 1: 프로젝트 스캐폴드 + 라우팅 골격

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`(존재), `src/main.jsx`, `src/App.jsx`, `src/index.css`
- Create(빈 골격): `src/pages/Home.jsx`, `src/pages/About.jsx`, `src/pages/Listings.jsx`, `src/pages/Process.jsx`, `src/pages/Policy.jsx`, `src/pages/Contact.jsx`

**Interfaces:**
- Produces: 6개 페이지 컴포넌트(default export, 인자 없음), `App`이 라우터로 이들을 렌더.

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "estarfield",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: index.html** (Pretendard CDN 포함)

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>e스타필드 공인중개사사무소 | 하남 미사·유니온 부동산</title>
    <meta name="description" content="하남 미사·유니온시티 상가·사무실·아파트·토지 매물. e스타필드 공인중개사사무소." />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 5: 빈 페이지 6개 생성** (각 파일, 이름만 바꿔 동일 패턴)

```jsx
// src/pages/Home.jsx  (About/Listings/Process/Policy/Contact 동일 패턴, 텍스트만 변경)
export default function Home() {
  return <div className="page"><h1>홈</h1></div>
}
```

- [ ] **Step 6: src/App.jsx — 라우터 골격**

```jsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Listings from './pages/Listings.jsx'
import Process from './pages/Process.jsx'
import Policy from './pages/Policy.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/process" element={<Process />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}
```

- [ ] **Step 7: src/index.css — CSS 변수 + 리셋 기초**

```css
:root {
  --navy: #0F2A4A;
  --navy-deep: #0A1E38;
  --gold: #C9A24B;
  --gold-light: #E4C877;
  --bg: #F7F8FA;
  --text: #1B2430;
  --muted: #6B7684;
  --white: #FFFFFF;
  --radius: 12px;
  --maxw: 1180px;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 20px; }
.page { max-width: var(--maxw); margin: 0 auto; padding: 48px 20px 80px; }
```

- [ ] **Step 8: 의존성 설치 + dev 서버 기동 검증**

Run: `cd /d D:\estarfield && npm install && npm run dev`
Expected: Vite가 `http://localhost:5173` 로 기동, 각 경로 방문 시 페이지 제목("홈" 등) 렌더.

- [ ] **Step 9: launch.json 생성** (`.claude/launch.json`)

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "estarfield-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }
  ]
}
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite+React project with routing skeleton"
```

---

### Task 2: 콘텐츠 데이터 소스 (src/data.js)

**Files:**
- Create: `src/data.js`

**Interfaces:**
- Produces (named exports):
  - `company`: `{ name, ceo, phone, email, address, brokerLicense, bizNumber, hours, region }`
  - `propertyTypes`: `Array<{ key, label, desc, icon }>` (key ∈ `store|office|home|land`)
  - `dealTypes`: `Array<{ key, label }>` (key ∈ `sale|jeonse|monthly`)
  - `listings`: `Array<{ id, title, typeKey, dealKey, area, price, deposit, monthly, location, floor, desc, thumb }>` (더미 8~10개)
  - `steps`: `Array<{ no, title, desc }>` (계약절차)
  - `feeTable`: `Array<{ category, range, rate, note }>` (중개보수 요율)
  - `faqs`: `Array<{ q, a }>`
  - `useMethods`: `Array<{ no, title, desc }>` (이용방법 3단계)

- [ ] **Step 1: data.js 작성 (전체 내용)**

```js
export const company = {
  name: 'e스타필드 공인중개사사무소',
  ceo: 'OOO (변경예정)',
  phone: '031-793-9500',
  email: 'contact@estarfield.kr (변경예정)',
  address: '경기 하남시 하남유니온로 70-1 에일린의뜰 단지내 상가 110호',
  brokerLicense: '제0000-0000-0000호 (변경예정)',
  bizNumber: '000-00-00000 (변경예정)',
  hours: '평일 09:00 - 19:00 · 주말/공휴일 예약 상담',
  region: '하남 미사·유니온시티',
}

export const propertyTypes = [
  { key: 'store', label: '상가/점포', desc: '근린상가·1층 점포·프랜차이즈 자리', icon: '🏪' },
  { key: 'office', label: '사무실/오피스', desc: '사무실·지식산업센터·오피스텔(업무용)', icon: '🏢' },
  { key: 'home', label: '아파트/주택', desc: '아파트·빌라·오피스텔(주거용)', icon: '🏠' },
  { key: 'land', label: '토지/건물', desc: '토지·건물(빌딩) 통매매', icon: '🏞️' },
]

export const dealTypes = [
  { key: 'sale', label: '매매' },
  { key: 'jeonse', label: '전세' },
  { key: 'monthly', label: '월세' },
]

export const listings = [
  { id: 1, title: '미사역 초역세권 1층 코너 상가', typeKey: 'store', dealKey: 'monthly', area: '49.5㎡(15평)', price: '', deposit: '5,000만원', monthly: '350만원', location: '하남시 미사강변대로', floor: '1층', desc: '유동인구 풍부한 코너 자리, 다양한 업종 가능. 권리금 협의.', thumb: '' },
  { id: 2, title: '에일린의뜰 단지내 상가', typeKey: 'store', dealKey: 'sale', area: '33.0㎡(10평)', price: '4억 2,000만원', deposit: '', monthly: '', location: '하남유니온로', floor: '1층', desc: '배후세대 탄탄한 단지내 상가. 안정적 임대수익.', thumb: '' },
  { id: 3, title: '유니온시티 지식산업센터 사무실', typeKey: 'office', dealKey: 'monthly', area: '82.6㎡(25평)', price: '', deposit: '2,000만원', monthly: '150만원', location: '하남시 유니온로', floor: '7층', desc: '신축 지산, 주차 편리, 즉시 입주 가능.', thumb: '' },
  { id: 4, title: '미사강변도시 오피스텔(업무용)', typeKey: 'office', dealKey: 'jeonse', area: '39.6㎡(12평)', price: '', deposit: '1억 5,000만원', monthly: '', location: '하남시 미사강변동로', floor: '12층', desc: '역세권 오피스텔, 재택·1인 사무실 적합.', thumb: '' },
  { id: 5, title: '미사강변 브라이튼 아파트 84㎡', typeKey: 'home', dealKey: 'sale', area: '84.9㎡(34평)', price: '9억 8,000만원', deposit: '', monthly: '', location: '하남시 미사강변한강로', floor: '15층', desc: '한강 조망, 학군·교통 우수. 남향 로열층.', thumb: '' },
  { id: 6, title: '풍산동 신축 빌라 전세', typeKey: 'home', dealKey: 'jeonse', area: '59.5㎡(18평)', price: '', deposit: '3억 2,000만원', monthly: '', location: '하남시 풍산동', floor: '3층', desc: '신축 풀옵션, 즉시 입주. 주차 가능.', thumb: '' },
  { id: 7, title: '하남 감일지구 근린생활용지', typeKey: 'land', dealKey: 'sale', area: '330㎡(100평)', price: '12억원', deposit: '', monthly: '', location: '하남시 감일동', floor: '-', desc: '상업지역 인접 근생용지, 개발 가치 우수.', thumb: '' },
  { id: 8, title: '미사동 상가건물 통매매', typeKey: 'land', dealKey: 'sale', area: '660㎡(200평)', price: '38억원', deposit: '', monthly: '', location: '하남시 미사동', floor: '지하1~지상4층', desc: '수익형 상가건물, 임대수익률 4%대. 투자문의 환영.', thumb: '' },
]

export const steps = [
  { no: 1, title: '매물 확인·상담', desc: '원하는 조건(지역·예산·용도)을 알려주시면 맞는 매물을 정리해 안내합니다.' },
  { no: 2, title: '현장 방문', desc: '실제 매물을 함께 둘러보고 입지·상태·주변 환경을 꼼꼼히 확인합니다.' },
  { no: 3, title: '조건 협의', desc: '가격·입주일·특약 등 거래 조건을 조율하고 등기·권리관계를 확인합니다.' },
  { no: 4, title: '계약 체결', desc: '계약서 작성 및 계약금 납부. 중개대상물 확인·설명서를 교부합니다.' },
  { no: 5, title: '잔금·이전/입주', desc: '잔금 지급, 소유권 이전 또는 입주까지 안전하게 마무리합니다.' },
]

export const feeTable = [
  { category: '매매·교환 (주택)', range: '거래금액 구간별', rate: '0.4% ~ 0.7%', note: '9억 이상 0.7% 이내 협의' },
  { category: '임대차 (주택)', range: '거래금액 구간별', rate: '0.3% ~ 0.6%', note: '6억 이상 0.6% 이내 협의' },
  { category: '오피스텔 (주거용 요건)', range: '매매/임대차', rate: '0.4% ~ 0.5%', note: '요건 충족 시 주택 준용' },
  { category: '상가·사무실·토지 등', range: '매매·임대차', rate: '0.9% 이내', note: '상호 협의로 결정' },
]

export const faqs = [
  { q: '중개보수(수수료)는 어떻게 계산되나요?', a: '거래금액과 매물 유형에 따라 법정 요율 범위 내에서 상호 협의로 결정됩니다. 계약 전 정확한 금액을 안내해 드립니다.' },
  { q: '매물을 내놓고 싶은데 어떻게 하나요?', a: '전화(031-793-9500) 또는 문의 페이지로 연락 주시면 방문/전화 상담 후 매물을 등록해 드립니다.' },
  { q: '허위매물은 없나요?', a: '현장 확인을 거친 매물만 안내하며, 등기·권리관계를 사전에 점검합니다.' },
  { q: '외지에서도 상담 가능한가요?', a: '전화·문자 상담 후 방문 일정을 잡아 드립니다. 하남 미사·유니온 권역 매물을 전문으로 합니다.' },
]

export const useMethods = [
  { no: 1, title: '전화·방문 상담', desc: '가장 빠릅니다. 031-793-9500 으로 전화하거나 사무소로 방문해 조건을 말씀해 주세요.' },
  { no: 2, title: '간편 문의 접수', desc: '문의 페이지에 조건을 남기시면 맞는 매물을 정리해 연락드립니다.' },
  { no: 3, title: '매물 직접 검색', desc: '매물정보 페이지에서 유형·거래유형으로 골라 관심 매물을 확인하세요.' },
]
```

- [ ] **Step 2: import 검증**

Run: dev 서버 켜진 상태에서 `src/App.jsx` 최상단에 임시로 `import { company } from './data.js'` 추가 후 저장 → 콘솔 에러 없음 확인 후 임시 import 제거.
Expected: HMR 리로드, 콘솔 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/data.js && git commit -m "feat: add central content/data source (company, listings, policy)"
```

---

### Task 3: 공통 레이아웃 (Header, Footer)

**Files:**
- Create: `src/components/Header.jsx`, `src/components/Footer.jsx`
- Modify: `src/App.jsx` (레이아웃 감싸기), `src/index.css` (헤더/푸터 스타일 추가)

**Interfaces:**
- Consumes: `company` from `../data.js`.
- Produces: `<Header />`, `<Footer />` (인자 없음). App은 `<Header/> {routes} <Footer/>` 구조로 렌더.

- [ ] **Step 1: Header.jsx** (로고 + 5메뉴 + 전화 CTA + 모바일 토글)

```jsx
import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { company } from '../data.js'

const menu = [
  { to: '/about', label: '회사소개' },
  { to: '/listings', label: '매물정보' },
  { to: '/process', label: '계약절차안내' },
  { to: '/policy', label: '부동산정책' },
  { to: '/contact', label: '문의' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="hdr">
      <div className="hdr-inner container">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-star">★</span>
          <span className="logo-text">e스타필드<small>공인중개사사무소</small></span>
        </Link>
        <button className="hdr-toggle" aria-label="메뉴" onClick={() => setOpen(!open)}>☰</button>
        <nav className={`hdr-nav ${open ? 'is-open' : ''}`}>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}>
              {m.label}
            </NavLink>
          ))}
          <a className="hdr-cta" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 {company.phone}</a>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Footer.jsx**

```jsx
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
```

- [ ] **Step 3: App.jsx에 레이아웃 적용**

```jsx
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Listings from './pages/Listings.jsx'
import Process from './pages/Process.jsx'
import Policy from './pages/Policy.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/process" element={<Process />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: index.css에 헤더/푸터 스타일 추가**

```css
/* Header */
.hdr { position: sticky; top: 0; z-index: 50; background: var(--white); border-bottom: 1px solid #eef0f3; }
.hdr-inner { display: flex; align-items: center; justify-content: space-between; height: 68px; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-star { color: var(--gold); font-size: 22px; }
.logo-text { font-weight: 800; color: var(--navy); font-size: 20px; line-height: 1; display: flex; flex-direction: column; }
.logo-text small { font-weight: 500; color: var(--muted); font-size: 11px; margin-top: 2px; }
.hdr-nav { display: flex; align-items: center; gap: 22px; }
.hdr-nav a { font-weight: 600; color: var(--text); font-size: 15px; }
.hdr-nav a.active { color: var(--navy); }
.hdr-nav a:hover { color: var(--gold); }
.hdr-cta { background: var(--navy); color: var(--white) !important; padding: 9px 16px; border-radius: 999px; font-size: 14px; }
.hdr-cta:hover { background: var(--navy-deep); }
.hdr-toggle { display: none; background: none; border: none; font-size: 24px; color: var(--navy); cursor: pointer; }
@media (max-width: 860px) {
  .hdr-toggle { display: block; }
  .hdr-nav { position: absolute; top: 68px; left: 0; right: 0; background: var(--white); flex-direction: column; align-items: flex-start; gap: 0; padding: 8px 20px; border-bottom: 1px solid #eef0f3; display: none; }
  .hdr-nav.is-open { display: flex; }
  .hdr-nav a { width: 100%; padding: 12px 0; border-bottom: 1px solid #f2f3f5; }
  .hdr-cta { margin: 10px 0; }
}
/* Footer */
.ftr { background: var(--navy-deep); color: #c7d2e0; margin-top: 60px; }
.ftr-inner { padding: 40px 20px; display: grid; gap: 14px; }
.ftr-brand strong { color: var(--white); font-size: 18px; }
.ftr-brand p { margin: 4px 0 0; color: var(--gold-light); }
.ftr-info p { margin: 2px 0; font-size: 14px; }
.ftr-copy { border-top: 1px solid rgba(255,255,255,.1); padding-top: 14px; font-size: 13px; color: #8ea0b5; }
```

- [ ] **Step 5: 검증**

Run: dev 서버에서 각 메뉴 클릭 → 라우팅 동작, 활성 메뉴 강조, 전화 링크 표시. 모바일 폭(≤860px)에서 햄버거 토글 동작.
Expected: 헤더 고정, 5메뉴+전화 CTA 노출, 푸터에 회사정보/더미값(변경예정) 표시.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add shared Header and Footer layout"
```

---

### Task 4: 재사용 UI 컴포넌트 (SectionTitle, CtaBanner)

**Files:**
- Create: `src/components/SectionTitle.jsx`, `src/components/CtaBanner.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces:
  - `SectionTitle({ eyebrow, title, sub })` — eyebrow(작은 골드 라벨), title(h2), sub(설명, optional)
  - `CtaBanner()` — "매물 문의는 전화가 가장 빠릅니다" + 전화버튼 + 문의 링크. `company` 소비.

- [ ] **Step 1: SectionTitle.jsx**

```jsx
export default function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div className="sec-title">
      {eyebrow && <span className="sec-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}
```

- [ ] **Step 2: CtaBanner.jsx**

```jsx
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
```

- [ ] **Step 3: index.css에 스타일 추가** (버튼·섹션타이틀·CTA배너)

```css
/* Buttons */
.btn { display: inline-block; padding: 12px 22px; border-radius: 999px; font-weight: 700; font-size: 15px; cursor: pointer; border: none; transition: .15s; }
.btn-gold { background: var(--gold); color: var(--navy-deep); }
.btn-gold:hover { background: var(--gold-light); }
.btn-navy { background: var(--navy); color: #fff; }
.btn-navy:hover { background: var(--navy-deep); }
.btn-ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,.6); }
.btn-ghost:hover { border-color: #fff; }
/* Section title */
.sec-title { text-align: center; max-width: 720px; margin: 0 auto 36px; }
.sec-eyebrow { display: inline-block; color: var(--gold); font-weight: 800; letter-spacing: .04em; font-size: 13px; margin-bottom: 8px; }
.sec-title h2 { font-size: 30px; color: var(--navy); margin: 0 0 10px; }
.sec-title p { color: var(--muted); margin: 0; }
/* CTA banner */
.cta-banner { background: var(--navy); color: #fff; }
.cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 44px 20px; flex-wrap: wrap; }
.cta-inner h3 { font-size: 24px; margin: 0 0 6px; }
.cta-inner p { margin: 0; color: #c7d2e0; }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
@media (max-width: 640px) { .sec-title h2 { font-size: 24px; } }
```

- [ ] **Step 4: 검증** — 임시로 Home.jsx에 `<CtaBanner/>` 렌더해 표시 확인 후 되돌림(또는 Task 5에서 사용).
Expected: 골드 버튼/네이비 배너 정상 렌더.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add SectionTitle and CtaBanner shared components"
```

---

### Task 5: 홈 페이지

**Files:**
- Create: `src/components/PropertyTypeCards.jsx`, `src/components/StepGuide.jsx`
- Modify: `src/pages/Home.jsx`, `src/index.css`

**Interfaces:**
- Consumes: `propertyTypes`, `useMethods`, `listings`, `company` from `../data.js`; `SectionTitle`, `CtaBanner`.
- Produces: `PropertyTypeCards()` (유형 4카드), `StepGuide({ items })` (번호형 단계 리스트, `items`는 `{no,title,desc}[]`).

- [ ] **Step 1: PropertyTypeCards.jsx**

```jsx
import { Link } from 'react-router-dom'
import { propertyTypes } from '../data.js'

export default function PropertyTypeCards() {
  return (
    <div className="type-grid">
      {propertyTypes.map((t) => (
        <Link key={t.key} to={`/listings?type=${t.key}`} className="type-card">
          <span className="type-icon">{t.icon}</span>
          <strong>{t.label}</strong>
          <p>{t.desc}</p>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: StepGuide.jsx**

```jsx
export default function StepGuide({ items }) {
  return (
    <div className="step-grid">
      {items.map((s) => (
        <div key={s.no} className="step-card">
          <span className="step-no">{s.no}</span>
          <strong>{s.title}</strong>
          <p>{s.desc}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Home.jsx 구성**

```jsx
import { Link } from 'react-router-dom'
import { company, useMethods, listings } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import PropertyTypeCards from '../components/PropertyTypeCards.jsx'
import StepGuide from '../components/StepGuide.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function Home() {
  const featured = listings.slice(0, 4)
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
                <div className="feat-thumb">{l.title.slice(0, 1)}</div>
                <div className="feat-body">
                  <span className="tag">{l.dealKey === 'sale' ? '매매' : l.dealKey === 'jeonse' ? '전세' : '월세'}</span>
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
```

- [ ] **Step 4: index.css에 홈 스타일 추가**

```css
/* Hero */
.hero { background: linear-gradient(135deg, var(--navy-deep), var(--navy)); color: #fff; }
.hero-inner { padding: 88px 20px 96px; }
.hero-eyebrow { color: var(--gold-light); font-weight: 700; letter-spacing: .04em; }
.hero h1 { font-size: 46px; line-height: 1.2; margin: 14px 0 16px; }
.hero h1 b { color: var(--gold); }
.hero p { font-size: 18px; color: #c7d2e0; max-width: 620px; margin: 0 0 28px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
/* Sections */
.section { padding: 64px 0; }
.section-alt { background: #eef1f5; }
.center-mt { text-align: center; margin-top: 28px; }
/* Type cards */
.type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.type-card { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); padding: 26px 20px; text-align: center; transition: .15s; }
.type-card:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,42,74,.08); }
.type-icon { font-size: 34px; display: block; margin-bottom: 10px; }
.type-card strong { color: var(--navy); font-size: 18px; display: block; margin-bottom: 6px; }
.type-card p { color: var(--muted); font-size: 14px; margin: 0; }
/* Steps */
.step-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.step-card { background: #fff; border-radius: var(--radius); padding: 28px 24px; border: 1px solid #e9ecf1; }
.step-no { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--navy); color: var(--gold); font-weight: 800; margin-bottom: 12px; }
.step-card strong { display: block; color: var(--navy); font-size: 18px; margin-bottom: 6px; }
.step-card p { margin: 0; color: var(--muted); }
/* Featured */
.feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.feat-card { background: #fff; border-radius: var(--radius); overflow: hidden; border: 1px solid #e9ecf1; }
.feat-thumb { height: 140px; background: linear-gradient(135deg, var(--navy), #24507f); color: rgba(255,255,255,.4); font-size: 48px; display: flex; align-items: center; justify-content: center; }
.feat-body { padding: 16px; }
.tag { display: inline-block; background: var(--gold); color: var(--navy-deep); font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 999px; margin-bottom: 8px; }
.feat-body strong { display: block; color: var(--navy); font-size: 15px; margin-bottom: 6px; }
.feat-body p { margin: 0; color: var(--muted); font-size: 13px; }
@media (max-width: 860px) { .type-grid, .feat-grid { grid-template-columns: repeat(2, 1fr); } .step-grid { grid-template-columns: 1fr; } .hero h1 { font-size: 34px; } }
@media (max-width: 480px) { .type-grid, .feat-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: 검증** — 홈에서 히어로/유형카드/이용방법/추천매물/CTA 모두 렌더, 반응형 확인.
Expected: 콘솔 에러 없음, 유형카드 클릭 시 `/listings?type=...` 이동.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build home page (hero, type cards, steps, featured, cta)"
```

---

### Task 6: 매물정보 페이지 (필터 + 그리드 + 상세)

**Files:**
- Create: `src/components/ListingCard.jsx`, `src/components/ListingFilter.jsx`, `src/components/ListingModal.jsx`
- Modify: `src/pages/Listings.jsx`, `src/index.css`

**Interfaces:**
- Consumes: `listings`, `propertyTypes`, `dealTypes`, `company` from `../data.js`; URL query `?type=` (react-router `useSearchParams`).
- Produces:
  - `ListingCard({ item, onClick })` — 매물 카드
  - `ListingFilter({ type, deal, onType, onDeal })` — 유형/거래 필터 버튼군
  - `ListingModal({ item, onClose })` — 상세 모달(item이 null이면 렌더 안 함)
  - `priceLabel(item)` 헬퍼는 `ListingCard` 내부 함수로 두되, 동일 로직을 모달에서도 씀 → `src/lib/format.js`로 분리하여 공유.
- Produces(추가): `src/lib/format.js` — `dealLabel(dealKey)`, `priceLabel(item)`.

- [ ] **Step 1: src/lib/format.js**

```js
import { dealTypes } from '../data.js'

export function dealLabel(dealKey) {
  return dealTypes.find((d) => d.key === dealKey)?.label ?? ''
}

export function priceLabel(item) {
  if (item.dealKey === 'sale') return `매매 ${item.price}`
  if (item.dealKey === 'jeonse') return `전세 ${item.deposit}`
  return `보증 ${item.deposit} / 월 ${item.monthly}`
}
```

- [ ] **Step 2: ListingCard.jsx**

```jsx
import { propertyTypes } from '../data.js'
import { dealLabel, priceLabel } from '../lib/format.js'

export default function ListingCard({ item, onClick }) {
  const typeLabel = propertyTypes.find((t) => t.key === item.typeKey)?.label ?? ''
  return (
    <button className="lc" onClick={() => onClick(item)}>
      <div className="lc-thumb"><span>{typeLabel}</span></div>
      <div className="lc-body">
        <span className="tag">{dealLabel(item.dealKey)}</span>
        <strong>{item.title}</strong>
        <p className="lc-price">{priceLabel(item)}</p>
        <p className="lc-meta">{item.location} · {item.area} · {item.floor}</p>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: ListingFilter.jsx**

```jsx
import { propertyTypes, dealTypes } from '../data.js'

export default function ListingFilter({ type, deal, onType, onDeal }) {
  return (
    <div className="lf">
      <div className="lf-row">
        <span className="lf-label">유형</span>
        <button className={type === 'all' ? 'on' : ''} onClick={() => onType('all')}>전체</button>
        {propertyTypes.map((t) => (
          <button key={t.key} className={type === t.key ? 'on' : ''} onClick={() => onType(t.key)}>{t.label}</button>
        ))}
      </div>
      <div className="lf-row">
        <span className="lf-label">거래</span>
        <button className={deal === 'all' ? 'on' : ''} onClick={() => onDeal('all')}>전체</button>
        {dealTypes.map((d) => (
          <button key={d.key} className={deal === d.key ? 'on' : ''} onClick={() => onDeal(d.key)}>{d.label}</button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: ListingModal.jsx**

```jsx
import { propertyTypes, company } from '../data.js'
import { dealLabel, priceLabel } from '../lib/format.js'

export default function ListingModal({ item, onClose }) {
  if (!item) return null
  const typeLabel = propertyTypes.find((t) => t.key === item.typeKey)?.label ?? ''
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="닫기">×</button>
        <span className="tag">{dealLabel(item.dealKey)} · {typeLabel}</span>
        <h3>{item.title}</h3>
        <p className="modal-price">{priceLabel(item)}</p>
        <ul className="modal-spec">
          <li><span>위치</span>{item.location}</li>
          <li><span>면적</span>{item.area}</li>
          <li><span>층</span>{item.floor}</li>
        </ul>
        <p className="modal-desc">{item.desc}</p>
        <a className="btn btn-gold" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 이 매물 문의 {company.phone}</a>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Listings.jsx** (필터 상태 + URL type 동기화)

```jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listings } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'
import ListingFilter from '../components/ListingFilter.jsx'
import ListingCard from '../components/ListingCard.jsx'
import ListingModal from '../components/ListingModal.jsx'

export default function Listings() {
  const [params] = useSearchParams()
  const [type, setType] = useState('all')
  const [deal, setDeal] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = params.get('type')
    if (t) setType(t)
  }, [params])

  const filtered = listings.filter(
    (l) => (type === 'all' || l.typeKey === type) && (deal === 'all' || l.dealKey === deal),
  )

  return (
    <div className="page">
      <SectionTitle eyebrow="LISTINGS" title="매물정보" sub="유형과 거래방식으로 원하는 매물을 찾아보세요." />
      <ListingFilter type={type} deal={deal} onType={setType} onDeal={setDeal} />
      {filtered.length === 0 ? (
        <p className="empty">해당 조건의 매물이 없습니다. 전화로 문의 주시면 맞는 매물을 찾아드립니다.</p>
      ) : (
        <div className="listing-grid">
          {filtered.map((l) => <ListingCard key={l.id} item={l} onClick={setSelected} />)}
        </div>
      )}
      <ListingModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
```

- [ ] **Step 6: index.css에 매물 스타일 추가**

```css
/* Filter */
.lf { display: grid; gap: 10px; margin-bottom: 26px; }
.lf-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lf-label { font-weight: 700; color: var(--navy); margin-right: 4px; font-size: 14px; }
.lf-row button { border: 1px solid #d7dce3; background: #fff; color: var(--text); padding: 7px 15px; border-radius: 999px; font-size: 14px; cursor: pointer; }
.lf-row button.on { background: var(--navy); color: #fff; border-color: var(--navy); }
/* Listing grid */
.listing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.lc { text-align: left; background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); overflow: hidden; cursor: pointer; padding: 0; transition: .15s; }
.lc:hover { border-color: var(--gold); box-shadow: 0 10px 24px rgba(15,42,74,.08); }
.lc-thumb { height: 150px; background: linear-gradient(135deg, var(--navy), #24507f); display: flex; align-items: center; justify-content: center; }
.lc-thumb span { color: rgba(255,255,255,.85); font-weight: 700; letter-spacing: .1em; }
.lc-body { padding: 16px; }
.lc-body strong { display: block; color: var(--navy); font-size: 16px; margin: 6px 0; }
.lc-price { color: var(--gold); font-weight: 800; margin: 0 0 6px; }
.lc-meta { color: var(--muted); font-size: 13px; margin: 0; }
.empty { text-align: center; color: var(--muted); padding: 48px 0; }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(10,30,56,.55); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
.modal { background: #fff; border-radius: 16px; max-width: 460px; width: 100%; padding: 28px; position: relative; }
.modal-x { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 26px; color: var(--muted); cursor: pointer; line-height: 1; }
.modal h3 { color: var(--navy); margin: 10px 0 6px; }
.modal-price { color: var(--gold); font-weight: 800; font-size: 18px; margin: 0 0 16px; }
.modal-spec { list-style: none; padding: 0; margin: 0 0 16px; border-top: 1px solid #eef0f3; }
.modal-spec li { display: flex; padding: 9px 0; border-bottom: 1px solid #eef0f3; font-size: 14px; }
.modal-spec li span { width: 70px; color: var(--muted); }
.modal-desc { color: var(--text); margin: 0 0 18px; }
@media (max-width: 860px) { .listing-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .listing-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 7: 검증** — `/listings` 접속: 필터 버튼 동작, 유형/거래 조합 필터링, 카드 클릭 시 모달, 홈 유형카드에서 `?type=store` 진입 시 해당 유형 선택 상태.
Expected: 필터·모달 정상, 콘솔 에러 없음.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: build listings page (filter, cards, detail modal)"
```

---

### Task 7: 회사소개 · 계약절차안내 · 부동산정책 페이지

**Files:**
- Modify: `src/pages/About.jsx`, `src/pages/Process.jsx`, `src/pages/Policy.jsx`, `src/index.css`

**Interfaces:**
- Consumes: `company`, `steps`, `feeTable`, `faqs` from `../data.js`; `SectionTitle`, `StepGuide`, `CtaBanner`.

- [ ] **Step 1: About.jsx**

```jsx
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
```

- [ ] **Step 2: Process.jsx**

```jsx
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
```

- [ ] **Step 3: Policy.jsx** (중개보수 요율 + FAQ)

```jsx
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
```

- [ ] **Step 4: index.css에 스타일 추가**

```css
/* About */
.about-greet { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); padding: 28px; margin-bottom: 22px; }
.about-greet p { margin: 0 0 12px; }
.about-greet b { color: var(--navy); }
.about-info { margin-bottom: 22px; }
.about-info h3, .policy-h, .proc-note h3 { color: var(--navy); font-size: 20px; margin: 8px 0 14px; }
.about-info ul { list-style: none; padding: 0; margin: 0; background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); }
.about-info li { display: flex; padding: 12px 18px; border-bottom: 1px solid #eef0f3; font-size: 15px; }
.about-info li:last-child { border-bottom: none; }
.about-info li span { width: 90px; color: var(--muted); flex-shrink: 0; }
.about-points { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 22px; }
.pt { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); padding: 22px; }
.pt strong { color: var(--navy); font-size: 17px; display: block; margin-bottom: 6px; }
.pt p { margin: 0; color: var(--muted); }
/* Process */
.proc-note { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); padding: 26px; margin-top: 26px; }
.proc-note ul { margin: 0 0 14px; padding-left: 18px; }
.proc-note li { margin: 6px 0; }
.proc-caution { color: var(--muted); font-size: 14px; margin: 0; }
/* Policy */
.fee-wrap { overflow-x: auto; }
.fee-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); overflow: hidden; }
.fee-table th, .fee-table td { padding: 13px 14px; text-align: left; border-bottom: 1px solid #eef0f3; font-size: 14px; }
.fee-table th { background: var(--navy); color: #fff; font-weight: 700; }
.fee-rate { color: var(--gold); font-weight: 800; white-space: nowrap; }
.policy-caution { color: var(--muted); font-size: 14px; margin: 12px 0 34px; }
.faq { display: grid; gap: 10px; }
.faq-item { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); overflow: hidden; }
.faq-q { width: 100%; text-align: left; background: none; border: none; padding: 16px 18px; font-size: 16px; font-weight: 600; color: var(--navy); cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.faq-q span { color: var(--gold); font-size: 22px; }
.faq-a { margin: 0; padding: 0 18px 18px; color: var(--text); }
@media (max-width: 860px) { .about-points { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: 검증** — `/about`, `/process`, `/policy` 각각 렌더 확인. Policy FAQ 아코디언 토글, 요율표 모바일 가로 스크롤.
Expected: 3페이지 정상, 콘솔 에러 없음.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build about, process, policy pages"
```

---

### Task 8: 문의 페이지 (데모 폼)

**Files:**
- Modify: `src/pages/Contact.jsx`, `src/index.css`

**Interfaces:**
- Consumes: `company` from `../data.js`; `SectionTitle`.
- 폼 제출은 미연동: `onSubmit`에서 `preventDefault` 후 감사 메시지 상태 표시(전송 없음).

- [ ] **Step 1: Contact.jsx**

```jsx
import { useState } from 'react'
import { company } from '../data.js'
import SectionTitle from '../components/SectionTitle.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', kind: '매물 문의', message: '' })
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = (e) => { e.preventDefault(); setSent(true) }

  return (
    <div className="page">
      <SectionTitle eyebrow="CONTACT" title="문의" sub="남겨주시면 확인 후 빠르게 연락드립니다." />
      <div className="contact-grid">
        <div className="contact-info">
          <h3>연락처</h3>
          <ul>
            <li><span>전화</span><a href={`tel:${company.phone.replace(/-/g, '')}`}>{company.phone}</a></li>
            <li><span>이메일</span>{company.email}</li>
            <li><span>주소</span>{company.address}</li>
            <li><span>영업시간</span>{company.hours}</li>
          </ul>
          <a className="map-link" href={`https://map.naver.com/v5/search/${encodeURIComponent(company.address)}`} target="_blank" rel="noreferrer">🗺️ 네이버 지도에서 위치 보기</a>
        </div>
        <div className="contact-form">
          {sent ? (
            <div className="sent-box">
              <strong>문의가 접수되었습니다. 감사합니다!</strong>
              <p>확인 후 빠르게 연락드리겠습니다. 급하시면 {company.phone} 로 전화 주세요.</p>
              <p className="demo-note">※ 현재 데모 화면으로, 실제 전송은 연동되어 있지 않습니다.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>이름<input name="name" value={form.name} onChange={change} required /></label>
              <label>연락처<input name="phone" value={form.phone} onChange={change} required placeholder="010-0000-0000" /></label>
              <label>문의유형
                <select name="kind" value={form.kind} onChange={change}>
                  <option>매물 문의</option><option>매물 내놓기</option><option>기타 상담</option>
                </select>
              </label>
              <label>문의내용<textarea name="message" value={form.message} onChange={change} rows={5} required /></label>
              <button className="btn btn-navy" type="submit">문의 보내기</button>
              <p className="demo-note">※ 데모 폼입니다. 제출해도 실제로 전송되지 않습니다.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: index.css에 문의 스타일 추가**

```css
.contact-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }
.contact-info { background: var(--navy); color: #dce4ee; border-radius: var(--radius); padding: 28px; }
.contact-info h3 { color: #fff; margin: 0 0 16px; }
.contact-info ul { list-style: none; padding: 0; margin: 0 0 20px; }
.contact-info li { display: flex; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.12); font-size: 15px; }
.contact-info li span { width: 80px; color: var(--gold-light); }
.contact-info a { color: #fff; }
.map-link { display: inline-block; color: var(--gold-light); font-weight: 600; }
.contact-form { background: #fff; border: 1px solid #e9ecf1; border-radius: var(--radius); padding: 28px; }
.contact-form label { display: block; margin-bottom: 14px; font-weight: 600; color: var(--navy); font-size: 14px; }
.contact-form input, .contact-form select, .contact-form textarea { width: 100%; margin-top: 6px; padding: 11px 12px; border: 1px solid #d7dce3; border-radius: 8px; font-size: 15px; font-family: inherit; font-weight: 400; color: var(--text); }
.contact-form textarea { resize: vertical; }
.demo-note { color: var(--muted); font-size: 13px; margin: 12px 0 0; }
.sent-box strong { color: var(--navy); font-size: 18px; display: block; margin-bottom: 10px; }
.sent-box p { margin: 0 0 8px; color: var(--text); }
@media (max-width: 780px) { .contact-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: 검증** — `/contact`: 폼 입력·제출 시 감사 메시지 전환, 지도 링크 새 탭, 전화 링크 동작.
Expected: 데모 폼 정상, 콘솔 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build contact page with demo inquiry form"
```

---

### Task 9: 마무리 (스크롤 리셋, 파비콘, README, 빌드 검증)

**Files:**
- Create: `src/components/ScrollToTop.jsx`, `public/favicon.svg`, `README.md`
- Modify: `src/App.jsx`, `index.html`

**Interfaces:**
- Produces: `ScrollToTop()` — 라우트 변경 시 `window.scrollTo(0,0)`. App 내부에 배치.

- [ ] **Step 1: ScrollToTop.jsx**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
```

- [ ] **Step 2: App.jsx에 ScrollToTop 추가** (`<Header/>` 위에 `<ScrollToTop />`)

```jsx
// import 추가
import ScrollToTop from './components/ScrollToTop.jsx'
// return 최상단에 <ScrollToTop /> 배치 (<><ScrollToTop /><Header />...)
```

- [ ] **Step 3: public/favicon.svg** (골드 별 on 네이비)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0F2A4A"/><path d="M32 12l6 13 14 1.5-10.5 9.5 3 14L32 46l-12.5 5 3-14L12 27.5 26 26z" fill="#C9A24B"/></svg>
```

- [ ] **Step 4: index.html에 파비콘 링크 추가** (`<head>` 내)

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 5: README.md**

```markdown
# e스타필드 공인중개사사무소 웹사이트

하남 미사·유니온시티 권역 부동산 중개 사무소 홈페이지. Vite + React.

## 개발
\`\`\`
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
\`\`\`

## 구조
- `src/data.js` — 회사정보·매물·정책 등 모든 콘텐츠(여기만 고치면 됩니다)
- `src/pages/` — 홈/회사소개/매물정보/계약절차안내/부동산정책/문의
- `src/components/` — 공통 컴포넌트

## 교체 대기(더미) 값 — `src/data.js`의 `company`
- 대표자(ceo), 이메일(email), 중개등록번호(brokerLicense), 사업자번호(bizNumber): `(변경예정)` 표시된 값
- 매물(listings): 데모 데이터 → 실제 매물로 교체

## 참고
- 문의 폼은 데모(미연동). 실제 전송은 백엔드/메일 연동 필요.
```

- [ ] **Step 6: 프로덕션 빌드 검증**

Run: `cd /d D:\estarfield && npm run build`
Expected: 에러 없이 `dist/` 생성.

- [ ] **Step 7: 전체 수동 점검** — dev 서버에서 6페이지 순회, 콘솔 에러 0, 반응형(모바일 폭), 파비콘 표시, 라우트 이동 시 스크롤 상단 리셋.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: add scroll reset, favicon, README, verify build"
```

---

## Self-Review

**Spec coverage:**
- 회사정보(확정+더미) → Task 2 `company`, Task 3 Footer, Task 7 About ✓
- 색상/폰트/반응형 → Task 1 CSS 변수 + 각 Task 스타일 ✓
- 홈(히어로·유형4카드·이용방법3단계·추천매물·CTA) → Task 5 ✓
- 회사소개 → Task 7 ✓
- 매물정보(유형/거래 필터·카드·상세) → Task 6 ✓
- 계약절차안내(타임라인) → Task 7 Process + Task 5 StepGuide 재사용 ✓
- 부동산정책(요율표·FAQ) → Task 7 Policy ✓
- 문의(데모 폼·지도·연락처) → Task 8 ✓
- 범위 밖(백엔드/회원/관리자/폼전송) 제외 → 반영됨 ✓

**Type consistency:** `dealLabel`/`priceLabel`(format.js)를 ListingCard·ListingModal 공유. `StepGuide({items})` 시그니처를 Home(useMethods)·Process(steps) 동일 사용. `company` 필드명 일관.

**Placeholder scan:** 각 코드 스텝에 실제 코드 포함. "더미" 회사정보는 의도된 값이며 `(변경예정)`으로 명시(스펙 요구사항).
