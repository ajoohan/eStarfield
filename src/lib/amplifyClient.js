import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'

// amplify_outputs.json은 CI(pipeline-deploy)가 생성한다.
// 로컬에 파일이 없으면 정적 폴백 모드로 동작(사이트는 계속 렌더).
const modules = import.meta.glob('../../amplify_outputs.json', { eager: true })
const outputs = Object.values(modules)[0]?.default ?? null

export const amplifyReady = Boolean(outputs?.data?.url)

if (amplifyReady) {
  Amplify.configure(outputs)
} else {
  // eslint-disable-next-line no-console
  console.warn('[amplify] amplify_outputs.json 이 없어 정적 폴백 모드로 동작합니다.')
}

// 공개 조회/문의 등록용(apiKey), 관리자 작업용(userPool)
//
// TODO(API 키 만료): apiKey는 365일마다 만료된다(최초 배포 2026-07-19 → 2027년 7월경).
// 만료되면 공개 사이트의 매물·게시물이 통째로 조회 불가가 된다.
// identityPool(게스트 역할) 전환을 시도했으나 백엔드 배포가 실패해 되돌렸다.
// 재시도할 때는 반드시 백엔드에 allow.guest() 가 실제로 적용됐는지 먼저 확인하고
// (게스트 IAM 서명 요청으로 검증) 그 다음에 이 authMode를 바꿀 것.
export const publicClient = amplifyReady ? generateClient({ authMode: 'apiKey' }) : null
export const adminClient = amplifyReady ? generateClient({ authMode: 'userPool' }) : null
