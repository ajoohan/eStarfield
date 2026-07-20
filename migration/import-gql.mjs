// Supabase → AppSync 원시 GraphQL 이전 (apiKey, 1회성)
import { readFileSync } from 'node:fs'

const GQL_URL = 'https://isffodyqdzfthm2dufo7fkha64.appsync-api.us-east-1.amazonaws.com/graphql'
const KEY = 'da2-gjjgfnvg7vfc3ozsr5tw25dkgm'

async function gql(query, variables) {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': KEY },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

const listings = JSON.parse(readFileSync(new URL('./data/listings.json', import.meta.url)))
const posts = JSON.parse(readFileSync(new URL('./data/posts.json', import.meta.url)))
const complexes = JSON.parse(readFileSync(new URL('./data/complexes.json', import.meta.url)))

let ok = 0, fail = 0
async function put(kind, mutation, input) {
  try {
    await gql(mutation, { input })
    ok++
  } catch (e) {
    fail++
    console.error(`[FAIL] ${kind}:`, e.message)
  }
}

const mListing = `mutation($input: CreateListingInput!){ createListing(input:$input){ id } }`
const mPost = `mutation($input: CreatePostInput!){ createPost(input:$input){ id } }`
const mComplex = `mutation($input: CreateComplexInput!){ createComplex(input:$input){ id } }`

for (const l of listings) {
  await put(`listing ${l.title}`, mListing, {
    title: l.title, typeKey: l.type_key, dealKey: l.deal_key,
    area: l.area || '', price: l.price || '', deposit: l.deposit || '', monthly: l.monthly || '',
    location: l.location || '', floor: l.floor || '', description: l.description || '',
    thumb: l.thumb || '', isActive: l.is_active ?? true, sortOrder: l.sort_order ?? 0,
  })
}
for (const p of posts) {
  await put(`post ${p.title}`, mPost, {
    board: p.board, category: p.category || '', title: p.title,
    department: p.department || '', phone: p.phone || '', duration: p.duration || '', fee: p.fee || '',
    howToApply: p.how_to_apply || '', requiredDocs: p.required_docs || '', steps: p.steps || '',
    relatedLaw: p.related_law || '', etcNote: p.etc_note || '', content: p.content || '',
    attachments: JSON.stringify(p.attachments || []), views: p.views ?? 0, isActive: p.is_active ?? true,
  })
}
for (const c of complexes) {
  await put(`complex ${c.name}`, mComplex, {
    name: c.name, category: c.category || '', description: c.description || '',
    tags: Array.isArray(c.tags) ? c.tags : [], image: c.image || '',
    sortOrder: c.sort_order ?? 0, isActive: c.is_active ?? true,
  })
}

console.log(`완료: 성공 ${ok}건 / 실패 ${fail}건 (총 ${listings.length + posts.length + complexes.length}건)`)
