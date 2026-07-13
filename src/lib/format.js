import { dealTypes } from '../data.js'

export function dealLabel(dealKey) {
  return dealTypes.find((d) => d.key === dealKey)?.label ?? ''
}

export function priceLabel(item) {
  if (item.dealKey === 'sale') return `매매 ${item.price}`
  if (item.dealKey === 'jeonse') return `전세 ${item.deposit}`
  return `보증 ${item.deposit} / 월 ${item.monthly}`
}
