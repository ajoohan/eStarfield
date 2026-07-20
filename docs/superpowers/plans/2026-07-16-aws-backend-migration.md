# v3: Supabase → AWS Amplify Gen 2 백엔드 이전 계획

확정: A안 (DynamoDB + Cognito + S3, Amplify 통합 백엔드), 데이터 전부 이전.

## 목표 구조
- **Data**: Amplify Data (AppSync + DynamoDB) — 모델 Listing / Post / Complex / Inquiry
- **Auth**: Cognito 이메일 로그인 (관리자 1명, 이메일 초대 방식으로 생성 — 비밀번호는 사용자가 설정)
- **Storage**: S3 (첨부·이미지, 공개 읽기 / 관리자 쓰기)
- **호스팅**: 기존 Amplify 앱에 fullstack 배포 (amplify/ 폴더 + pipeline-deploy)

## 권한 모델
- Listing/Post/Complex: 공개 read(apiKey), 관리자(userPool) 전체
- Inquiry: 공개 create만, 관리자 read/update/delete (개인정보 보호 유지)
- 조회수: custom mutation incrementPostViews (public 허용, views만 +1)
- 데이터 이전 기간에만 apiKey create 허용 → 이전 완료 후 제거 push

## Phase
1. **P0 데이터 추출**: 공개 3종(listings/posts/complexes)은 anon REST로 추출(migration/data/*.json), 스토리지 파일 다운로드(migration/files/). 문의(inquiries)는 관리자 세션(Chrome admin 페이지의 인증 클라이언트)으로 추출
2. **P1 백엔드 정의**: amplify/{backend.ts, auth, data, storage} 작성, amplify.yml fullstack 전환, Amplify 앱 서비스 롤 연결(콘솔)
3. **P2 프론트 전환**: supabase-js 제거 → aws-amplify(Data/Auth/Storage), 로그인 NEW_PASSWORD 챌린지 처리, 업로드/조회수/회신 전부 전환. 로컬 검증은 콘솔에서 amplify_outputs.json 다운로드
4. **P3 데이터 이전**: 임시 apiKey 쓰기 + 게스트 스토리지 쓰기로 import 스크립트 실행 → 완료 후 권한 회수 push
5. **P4 관리자 계정**: Cognito 이메일 초대(estarhanam@naver.com) — 임시 비밀번호 메일 수신 후 사용자가 새 비밀번호 설정
6. **P5 검증·정리**: 전 기능 검증 → Supabase 프로젝트 일시정지(pause) → 안정 확인 후 삭제 안내

## 주의
- 기존 이미지/첨부의 Supabase URL은 S3 URL로 재작성
- vercel.json은 잔재(무해), README·deploy-aws.md 갱신
- 관리자 버전 표기 1.0으로 (백엔드 완전 이전 기념)
