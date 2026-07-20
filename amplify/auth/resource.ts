import { defineAuth } from '@aws-amplify/backend'

// 관리자 로그인(이메일). 회원가입은 콘솔에서 관리자만 생성해 사용.
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
})
