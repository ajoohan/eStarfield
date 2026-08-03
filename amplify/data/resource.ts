import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

// 권한 요약
// - 공개(guest = Cognito 자격증명풀 비인증 역할): 콘텐츠 read / 문의 create / 조회수 증가
//   → 프런트엔드 publicClient가 쓰는 경로. API 키와 달리 만료가 없다.
// - 공개(apiKey): guest와 동일 범위. 만료(365일)가 있어 주 경로로는 쓰지 않지만,
//   외부 도구·비상용으로 남겨 둔다. 제거하려면 프런트가 identityPool을 쓰는지 먼저 확인할 것.
// - 관리자(userPool): 전체 CRUD
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
      allow.guest().to(['read']),
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
      allow.guest().to(['read']),
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
      allow.guest().to(['read']),
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
      allow.guest().to(['create']),
      allow.publicApiKey().to(['create']),
      allow.authenticated(),
    ]),

  // 조회수 +1 (공개 호출 가능, views만 증가)
  incrementPostViews: a
    .mutation()
    .arguments({ id: a.id().required() })
    .returns(a.ref('Post'))
    .authorization((allow) => [allow.guest(), allow.publicApiKey(), allow.authenticated()])
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
