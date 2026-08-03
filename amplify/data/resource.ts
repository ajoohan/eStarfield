import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

// 권한 요약
// - 공개(apiKey): 콘텐츠 read / 문의 create / 조회수 증가
// - 관리자(userPool): 전체 CRUD
//
// TODO(API 키 만료): apiKey는 365일 만료. allow.guest() 추가로 만료 없는 게스트 인증
// 전환을 시도했으나 배포가 실패해 되돌렸다(2026-08-03). 재시도 시 빌드 로그로
// 실패 원인을 먼저 확인할 것 — 프런트(amplifyClient.js) 주석 참조.
const schema = a.schema({
  Listing: a
    .model({
      title: a.string().required(),
      typeKey: a.string().required(),
      dealKey: a.string().required(),
      area: a.string(),
      price: a.string(),
      deposit: a.string(),
      monthly: a.string(),
      location: a.string(),
      floor: a.string(),
      description: a.string(),
      thumb: a.string(),
      isActive: a.boolean().default(true),
      sortOrder: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated(),
    ]),

  Post: a
    .model({
      board: a.string().required(),
      category: a.string(),
      title: a.string().required(),
      department: a.string(),
      phone: a.string(),
      duration: a.string(),
      fee: a.string(),
      howToApply: a.string(),
      requiredDocs: a.string(),
      steps: a.string(),
      relatedLaw: a.string(),
      etcNote: a.string(),
      content: a.string(),
      attachments: a.json(),
      views: a.integer().default(0),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated(),
    ]),

  Complex: a
    .model({
      name: a.string().required(),
      category: a.string(),
      description: a.string(),
      tags: a.string().array(),
      image: a.string(),
      sortOrder: a.integer().default(0),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated(),
    ]),

  Inquiry: a
    .model({
      name: a.string().required(),
      phone: a.string().required(),
      email: a.string(),
      kind: a.string(),
      message: a.string(),
      handled: a.boolean().default(false),
      reply: a.string(),
      repliedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['create']),
      allow.authenticated(),
    ]),

  // 조회수 +1 (공개 호출 가능, views만 증가)
  incrementPostViews: a
    .mutation()
    .arguments({ id: a.id().required() })
    .returns(a.ref('Post'))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(
      a.handler.custom({
        dataSource: a.ref('Post'),
        entry: './increment-views.js',
      }),
    ),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
})
