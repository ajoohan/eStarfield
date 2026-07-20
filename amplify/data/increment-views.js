import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.id }),
    update: {
      expression: 'ADD #views :one',
      expressionNames: { '#views': 'views' },
      expressionValues: util.dynamodb.toMapValues({ ':one': 1 }),
    },
  }
}

export function response(ctx) {
  return ctx.result
}
