import { defineStorage } from '@aws-amplify/backend'

// 첨부파일·이미지 저장소.
// public/* : 누구나 읽기(사이트 이미지·서식파일), 관리자만 쓰기/삭제
export const storage = defineStorage({
  name: 'estarfieldFiles',
  access: (allow) => ({
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
})
