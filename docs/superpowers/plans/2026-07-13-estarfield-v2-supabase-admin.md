# e스타필드 v2 (Supabase 백엔드 + 관리자 + 메뉴/페이지 확장) Implementation Plan

> **For agentic workers:** subagent-driven-development로 태스크별 구현. 각 태스크 끝에 커밋.

**Goal:** 기존 브로슈어 사이트에 Supabase 백엔드(매물·문의)와 관리자 페이지를 붙이고, 메뉴/회사소개/주변단지소개 페이지를 확장한다. Vercel 배포.

**Architecture:** 프론트는 그대로 Vite+React SPA. 매물은 Supabase `listings`에서 로드(폴백: data.js `listings`), 문의는 `inquiries`에 저장. 관리자 `/admin`은 Supabase Auth 로그인 후 매물 CRUD + 문의 조회. `/admin`에서는 공통 Header/Footer 숨김.

**Tech Stack:** 기존 + @supabase/supabase-js v2. 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`(.env, 커밋 제외).

## Global Constraints
- 기반 완료: `src/lib/supabase.js`(export `supabase`, `supabaseReady`), `supabase/schema.sql`, `.env`(gitignored), `.env.example`.
- 회사정보(정확히, data.js `company`): name `e스타필드 공인중개사사무소`, ceo `이훈희`, phone `031-793-9500`, mobiles `['010-7705-4600','010-7607-3161']`, fax `031-794-2444`, email `estarhanam@naver.com`, address `경기도 하남시 하남유니온로 70-1, 110호`, addressDetail `하남에일린의뜰 단지내 상가 內 공인중개사사무소`, brokerLicense `41450-2022-00016`, bizNumber `307-12-93306`.
- 메뉴(정확히 이 순서): 회사소개(/about) · 주변단지소개(/complexes) · 매물정보(/listings) · 계약절차안내(/process) · 부동산정책(/policy) · 문의(/contact).
- 매물 유형 키 store/office/home/land; 거래 sale/jeonse/monthly.
- DB 컬럼(snake_case)↔JS(camelCase) 매핑: type_key→typeKey, deal_key→dealKey, description→desc. 나머지 동일.
- data.js 콘텐츠 단일 소스(정적). 동적 데이터는 Supabase.
- 색상 CSS 변수(브랜드), 반응형. tel 링크 하이픈 제거.
- 단위 테스트 없음 — 검증은 dev/build. `.env`가 있으면 실제 Supabase 연동 확인 가능(단, 스키마 SQL이 아직 실행 안 됐을 수 있으니 폴백/에러 처리 필수).

---

### Task V1: 데이터 접근 계층 + 메뉴/라우팅/레이아웃

**Files:**
- Create: `src/lib/listingsApi.js`
- Modify: `src/components/Header.jsx`(메뉴 6개), `src/App.jsx`(라우트 /complexes,/admin + /admin 레이아웃 숨김), `src/components/Footer.jsx`(휴대폰·팩스 표시), `src/index.css`

**Interfaces:**
- `listingsApi.js` exports `async fetchListings()`:
  - supabaseReady면 `supabase.from('listings').select('*').eq('is_active',true).order('sort_order')`.
  - 성공+행 있으면 각 행을 `{id,title,typeKey:type_key,dealKey:deal_key,area,price,deposit,monthly,location,floor,desc:description,thumb}`로 매핑해 반환.
  - 실패/빈결과/미설정이면 data.js의 정적 `listings` 반환(폴백).
- Header 메뉴 배열에 `{to:'/complexes',label:'주변단지소개'}`를 회사소개 다음에 추가(6개).
- App: `/complexes`→Complexes, `/admin`→Admin 라우트 추가. `useLocation`으로 pathname이 `/admin`으로 시작하면 Header/Footer/ScrollToTop 대신 관리자 전용 렌더(Header·Footer 숨김). Complexes/Admin 페이지 컴포넌트는 이 태스크에서 최소 플레이스홀더로 생성만 하고 내용은 후속 태스크에서 채운다.
- Footer: 기존 연락처 줄에 휴대폰(`mobiles.join(' / ')`)·팩스(`fax`) 추가.

- [ ] Step 1: `src/pages/Complexes.jsx`, `src/pages/Admin.jsx` 최소 플레이스홀더 생성(`<div className="page"><h1>...</h1></div>`).
- [ ] Step 2: `listingsApi.js` 작성(위 스펙).
- [ ] Step 3: Header 메뉴에 주변단지소개 추가(회사소개 다음). Step 4: App에 라우트 추가 + `/admin` 경로에서 Header/Footer/ScrollToTop 숨김(관리자 페이지는 자체 레이아웃). Step 5: Footer에 휴대폰·팩스 추가.
- [ ] Step 6: `npm run build` 통과 + dev에서 6개 메뉴 노출, /complexes·/admin 접근 시 (admin은 헤더/푸터 없이) 렌더, 다른 페이지엔 헤더/푸터 정상. Step 7: commit `feat: data-access layer, 6-menu nav, /complexes·/admin routes, admin layout`.

---

### Task V2: 매물정보·홈을 Supabase 연동

**Files:** Modify `src/pages/Listings.jsx`, `src/pages/Home.jsx`

**Interfaces:** Consumes `fetchListings` from `../lib/listingsApi.js`.
- Listings.jsx: `useState`로 매물 배열/로딩 상태. `useEffect`에서 `fetchListings()` 호출해 채움. 기존 필터(type/deal)·모달·URL ?type 동기화 유지. 로딩 중 "불러오는 중…", 결과 0건 empty-state 유지. (기존 정적 import 제거하고 상태 사용.)
- Home.jsx: featured도 `fetchListings()`로 로드해 `slice(0,4)`. 로드 전엔 빈 배열/placeholder. 나머지 홈 구성 유지.

- [ ] Step 1: Listings.jsx를 fetchListings 기반으로 수정(필터/모달/URL 동기화 보존). Step 2: Home featured를 fetchListings 기반으로 수정.
- [ ] Step 3: build + dev 검증(매물 그리드가 DB(또는 폴백)에서 로드, 필터·모달·홈 추천 정상, 콘솔 에러 없음). Step 4: commit `feat: load listings from Supabase (fallback to static)`.

---

### Task V3: 문의 폼 → Supabase 저장

**Files:** Modify `src/pages/Contact.jsx`

**Interfaces:** Consumes `supabase`, `supabaseReady` from `../lib/supabase.js`, `company` from data.js.
- 제출 시 `await supabase.from('inquiries').insert({name, phone, kind, message})`.
  - 성공: 감사 메시지 표시(실제 접수됨 — "데모/미연동" 문구 제거).
  - 실패 또는 supabaseReady=false: 에러 안내 + "전화(031-793-9500)로 문의 주세요" 폴백 메시지. 콘솔에 에러 로깅.
  - 제출 중 버튼 비활성화(로딩 상태). 개인정보(연락처)는 URL에 넣지 않음(현재도 폼 state만 사용).
- 연락처 정보 블록에 휴대폰(mobiles)·팩스(fax) 추가.

- [ ] Step 1: Contact.jsx 제출 핸들러를 supabase insert로 변경(로딩/성공/실패 처리) + 연락처에 휴대폰·팩스 추가 + 데모 문구 제거. Step 2: build + dev 검증(제출 시 로딩→감사, supabase 미설정/실패 시 폴백 안내). Step 3: commit `feat: save inquiries to Supabase`.

---

### Task V4: 회사소개 페이지 (realmidas /company 스타일)

**Files:** Modify `src/pages/About.jsx`, `src/index.css`

**Interfaces:** Consumes `company`, `greeting` from data.js; `SectionTitle`, `CtaBanner`.
- 상단: 인사말 섹션(`greeting` 문단들, 큰 타이포·여백). realmidas /company 처럼 대표 인사말 중심 레이아웃.
- 하단: 사무소 정보 카드/표 — 상호, 위치설명(addressDetail), 주소(address), 연락처(phone + mobiles), 팩스(fax), 이메일, 대표(공인중개사) ceo, 등록번호(brokerLicense), 사업자등록번호(bizNumber), 영업시간(hours). 라벨-값 정렬.
- CtaBanner로 마무리. 모든 값은 data.js에서(하드코딩 금지).

- [ ] Step 1: About.jsx 재구성(인사말 + 정보 표). Step 2: About CSS append. Step 3: build + dev 검증(인사말·전체 정보 정확 표기, 반응형). Step 4: commit `feat: rebuild About page (greeting + office info)`.

---

### Task V5: 주변단지소개 페이지

**Files:** Modify `src/pages/Complexes.jsx`, `src/index.css`

**Interfaces:** Consumes `complexes`, `company` from data.js; `SectionTitle`, `CtaBanner`.
- SectionTitle(eyebrow "NEARBY", title "주변단지소개", sub 지역 설명).
- `complexes` 카드 그리드: name, category, desc, tags(칩). 본 사무소 단지는 강조(태그 '본사무소').
- 안내 문구: "정보는 예시이며 실제와 다를 수 있습니다. 정확한 단지 정보·시세는 문의 바랍니다." + CtaBanner.

- [ ] Step 1: Complexes.jsx 구성. Step 2: CSS append. Step 3: build + dev 검증. Step 4: commit `feat: build 주변단지소개 page`.

---

### Task V6: 관리자 페이지 (/admin) — Supabase Auth + 매물 CRUD + 문의 조회

**Files:** Modify `src/pages/Admin.jsx`; Create `src/components/admin/AdminLogin.jsx`, `src/components/admin/ListingsManager.jsx`, `src/components/admin/InquiriesManager.jsx`; Modify `src/index.css`

**Interfaces:** Consumes `supabase` from `../lib/supabase.js`; `propertyTypes`, `dealTypes` from data.js.
- 인증: `supabase.auth.getSession()`으로 초기 세션 확인 + `supabase.auth.onAuthStateChange` 구독. 미로그인 시 `AdminLogin`(이메일/비번 → `supabase.auth.signInWithPassword`). 로그인 실패 메시지 표시.
- 로그인 후 Admin 레이아웃: 상단 바(제목 + 로그아웃 `supabase.auth.signOut`), 탭 2개(매물관리/문의함).
- `ListingsManager`: `supabase.from('listings').select('*').order('sort_order')`로 목록(비활성 포함). 추가/수정 폼(title,type_key,deal_key,area,price,deposit,monthly,location,floor,description,is_active,sort_order) → insert/update. 삭제(delete) 확인 후. 저장 후 목록 새로고침. 유형/거래 select는 propertyTypes/dealTypes 사용.
- `InquiriesManager`: `supabase.from('inquiries').select('*').order('created_at',{ascending:false})`. 목록(이름·연락처·유형·내용·접수시각·처리여부). '처리완료' 토글(update handled). 삭제(옵션).
- 모든 쓰기는 RLS상 authenticated만 가능(로그인 상태). 에러는 사용자에게 표시.
- `/admin`은 Header/Footer 없이 렌더(Task V1에서 처리됨).

- [ ] Step 1: AdminLogin.jsx(로그인 폼). Step 2: ListingsManager.jsx(CRUD). Step 3: InquiriesManager.jsx(조회+처리토글). Step 4: Admin.jsx(세션 관리 + 탭 + 로그아웃). Step 5: admin CSS append. Step 6: build + dev 검증(미로그인→로그인폼; 로그인 후 탭·CRUD·문의목록; 로그아웃). Step 7: commit `feat: admin page (auth, listings CRUD, inquiries)`.

---

## 배포 (구현 후, 사용자 협조 필요)
- 사용자: Supabase SQL Editor에서 `supabase/schema.sql` 실행; Authentication→Users에 관리자 계정 추가.
- 사용자: GitHub `estarfield`(Private, 빈) 생성.
- 컨트롤러: remote 추가 후 push.
- 사용자: Vercel Import(Vite 자동감지) + 환경변수 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 설정 + Deploy.

## Self-Review
- 메뉴 6개/라우트/레이아웃 → V1. 매물 DB → V2. 문의 DB → V3. 회사소개 → V4. 주변단지 → V5. 관리자 → V6. 회사정보(휴대폰·팩스) → V1(footer)+V3(contact)+V4(about). 배포 → 별도 절차.
- 폴백: Supabase 미설정/스키마 미실행 시에도 사이트가 정적 폴백으로 동작(V1 fetchListings, V3 안내).
