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

// 공개 조회/문의 등록용, 관리자 작업용(userPool)
//
// 공개 경로는 identityPool(= Cognito 자격증명풀의 게스트 역할)을 쓴다.
// apiKey는 365일마다 만료돼 그날 사이트의 매물이 통째로 사라지는데,
// 게스트 역할은 만료가 없다. 백엔드에는 apiKey 권한도 함께 열려 있으므로
// 문제가 생기면 이 한 줄만 'apiKey'로 되돌리면 즉시 복구된다.
export const publicClient = amplifyReady ? generateClient({ authMode: 'identityPool' }) : null
export const adminClient = amplifyReady ? generateClient({ authMode: 'userPool' }) : null
