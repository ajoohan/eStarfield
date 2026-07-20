// Supabase → Amplify Data 이전 스크립트 (1회성)
// 사용: amplify_outputs.json을 프로젝트 루트에 둔 뒤  node migration/import.mjs
// apiKey 모드의 [MIGRATION] create 임시 권한을 사용한다.
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { readFileSync } from 'node:fs'

const outputs = JSON.parse(readFileSync(new URL('../amplify_outputs.json', import.meta.url)))
Amplify.configure(outputs)
const client = generateClient({ authMode: 'apiKey' })

const listings = JSON.parse(readFileSync(new URL('./data/listings.json', import.meta.url)))
const posts = JSON.parse(readFileSync(new URL('./data/posts.json', import.meta.url)))
const complexes = JSON.parse(readFileSync(new URL('./data/complexes.json', import.meta.url)))

let ok = 0, fail = 0
async function put(kind, fn) {
  try {
    const { errors } = await fn()
    if (errors?.length) throw new Error(errors[0]?.message)
    ok++
  } catch (e) {
    fail++
    console.error(`[FAIL] ${kind}:`, e.message)
  }
}

for (const l of listings) {
  await put(`listing ${l.title}`, () =>
    client.models.Listing.create({
      title: l.title, typeKey: l.type_key, dealKey: l.deal_key,
      area: l.area || '', price: l.price || '', deposit: l.deposit || '', monthly: l.monthly || '',
      location: l.location || '', floor: l.floor || '', description: l.description || '',
      thumb: l.thumb || '', isActive: l.is_active ?? true, sortOrder: l.sort_order ?? 0,
    }),
  )
}

for (const p of posts) {
  await put(`post ${p.title}`, () =>
    client.models.Post.create({
      board: p.board, category: p.category || '', title: p.title,
      department: p.department || '', phone: p.phone || '', duration: p.duration || '', fee: p.fee || '',
      howToApply: p.how_to_apply || '', requiredDocs: p.required_docs || '', steps: p.steps || '',
      relatedLaw: p.related_law || '', etcNote: p.etc_note || '', content: p.content || '',
      attachments: JSON.stringify(p.attachments || []), views: p.views ?? 0, isActive: p.is_active ?? true,
    }),
  )
}

for (const c of complexes) {
  await put(`complex ${c.name}`, () =>
    client.models.Complex.create({
      name: c.name, category: c.category || '', description: c.description || '',
      tags: Array.isArray(c.tags) ? c.tags : [], image: c.image || '',
      sortOrder: c.sort_order ?? 0, isActive: c.is_active ?? true,
    }),
  )
}

console.log(`\n완료: 성공 ${ok}건 / 실패 ${fail}건 (매물 ${listings.length}·게시물 ${posts.length}·단지 ${complexes.length})`)
