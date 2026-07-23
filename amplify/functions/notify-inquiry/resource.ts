import { defineFunction } from '@aws-amplify/backend'

// 문의 테이블 스트림 트리거:
// - INSERT: 관리자에게 새 문의 알림 메일
// - MODIFY(회신 저장): 문의자 이메일로 답변 메일
export const notifyInquiry = defineFunction({
  name: 'notify-inquiry',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    ADMIN_EMAIL: 'estarhanam@gmail.com',
    FROM_EMAIL: '"eStarfield" <no-reply@estarfd.store>',
    SITE_URL: 'https://estarfd.store',
  },
})
