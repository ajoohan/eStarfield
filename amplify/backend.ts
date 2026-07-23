import { defineBackend } from '@aws-amplify/backend'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { notifyInquiry } from './functions/notify-inquiry/resource'

const backend = defineBackend({
  auth,
  data,
  storage,
  notifyInquiry,
})

// 문의 테이블 스트림 → 메일 알림 Lambda
const inquiryTable = backend.data.resources.tables['Inquiry']
const notifyFn = backend.notifyInquiry.resources.lambda

notifyFn.addEventSource(
  new DynamoEventSource(inquiryTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 5,
    retryAttempts: 2,
  }),
)

notifyFn.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail'],
    resources: ['*'],
  }),
)
