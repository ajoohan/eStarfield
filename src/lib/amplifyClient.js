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
export const publicClient = amplifyReady ? generateClient({ authMode: 'apiKey' }) : null
export const adminClient = amplifyReady ? generateClient({ authMode: 'userPool' }) : null
