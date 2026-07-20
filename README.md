# e스타필드 공인중개사사무소 웹사이트

하남 미사·유니온시티 부동산 중개사무소 홈페이지 — https://estarfd.store

## 아키텍처 (전부 AWS)
- **호스팅**: AWS Amplify Hosting (GitHub `master` push 시 자동 배포)
- **백엔드**: Amplify Gen 2 — `amplify/` 폴더
  - Data: AppSync + DynamoDB (Listing / Post / Complex / Inquiry)
  - Auth: Cognito (관리자 로그인, `/admin`)
  - Storage: S3 (이미지·첨부, public 읽기 / 관리자 쓰기)
- **도메인**: estarfd.store (등록: 카페24, DNS: Route 53)

## 개발
```
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```
로컬에서 실데이터로 개발하려면 Amplify 콘솔(브랜치 → 배포된 백엔드 리소스)에서
`amplify_outputs.json`을 다운로드해 프로젝트 루트에 두세요(없으면 정적 폴백으로 렌더).

## 구조
- `amplify/` — 백엔드 정의(모델·권한·스토리지)
- `src/lib/` — 데이터 계층(amplifyClient, listingsApi, postsApi, complexesApi, storage)
- `src/data.js` — 정적 콘텐츠(회사정보 등) + 백엔드 미설정 시 폴백
- `src/pages`, `src/components` — 화면
- `migration/` — Supabase → AWS 이전 기록(완료됨, 참고용)

## 권한 모델
- 공개: 활성 콘텐츠 읽기, 문의 등록, 게시물 조회수 증가만 가능
- 관리자(Cognito): 전체 CRUD (`/admin` — 매물·게시판·단지·문의함)
