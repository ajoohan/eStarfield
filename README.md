# e스타필드 공인중개사사무소 웹사이트

하남 미사·유니온시티 권역 부동산 중개 사무소 홈페이지. Vite + React.

## 개발
```
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## 구조
- `src/data.js` — 회사정보·매물·정책 등 모든 콘텐츠(여기만 고치면 됩니다)
- `src/pages/` — 홈/회사소개/매물정보/계약절차안내/부동산정책/문의
- `src/components/` — 공통 컴포넌트

## 교체 대기(더미) 값
- 회사 정보(`src/data.js`의 `company`)는 모두 확정된 값입니다.
- 매물(listings): 데모 데이터 → 실제 매물로 교체

## 참고
- 문의 폼은 데모(미연동). 실제 전송은 백엔드/메일 연동 필요.
