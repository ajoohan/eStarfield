# AWS Amplify 배포 가이드 (e스타필드)

Vercel → AWS Amplify Hosting 이전 절차. 빌드 설정은 저장소의 `amplify.yml`이 자동 적용된다.

## 1. Amplify 앱 생성 (AWS 콘솔)
1. AWS 콘솔 → **Amplify** → **Create new app** → **GitHub** 선택
2. GitHub 인증 후 저장소 `ajoohan/eStarfield`, 브랜치 `master` 선택
3. 빌드 설정은 `amplify.yml` 자동 인식 → 그대로 **Save and deploy**
4. 배포 완료 후 `https://master.xxxx.amplifyapp.com` 주소로 사이트 확인

## 2. Rewrites and redirects 설정 (필수)
Amplify 콘솔 → 해당 앱 → **Hosting → Rewrites and redirects** → **Manage redirects** → **Open text editor**에 아래 JSON 붙여넣기:

```json
[
  { "source": "/admin", "target": "/admin.html", "status": "200" },
  { "source": "/admin/<*>", "target": "/admin.html", "status": "200" },
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|svg|txt|map|json|webp|woff|woff2)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200"
  }
]
```

(1·2번: 관리자 전용 메타 HTML, 3번: SPA 딥링크 새로고침 대응 — vercel.json과 동일 역할)

## 3. 커스텀 도메인 연결 (카페24 도메인)
1. Amplify 콘솔 → **Hosting → Custom domains** → **Add domain** → 도메인 입력
2. Amplify가 표시하는 **CNAME 레코드 2종**을 확인:
   - SSL 인증서 검증용 CNAME 1개 (`_xxxx.도메인` → `_yyyy.acm-validations.aws.`)
   - 도메인 연결용 CNAME (www 등 → `xxxx.cloudfront.net`)
3. **카페24** → 나의서비스관리 → 도메인 관리 → **DNS 관리(호스트IP/CNAME 관리)** 에서 위 레코드 입력
   - 루트 도메인(예: example.com)은 CNAME 불가 → Amplify가 안내하는 ANAME/A 레코드 방식 또는 www로 리다이렉트 설정 사용
4. 검증·발급 완료(수분~수시간) 후 `https://도메인` 접속 확인

## 4. 이전 마무리
- OG 메타의 절대 URL(index.html/admin.html의 `og:url`, `og:image`)을 새 도메인으로 교체
- Vercel 프로젝트 삭제(또는 도메인 해제)
- Supabase는 그대로 사용(호스팅과 무관)

## 참고
- Node 22 이상 권장(supabase-js). Amplify 빌드 이미지 설정에서 Node 버전 지정 가능
- push → Amplify 자동 재배포 (Vercel과 동일한 워크플로)
