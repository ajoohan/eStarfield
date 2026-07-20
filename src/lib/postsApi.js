import { publicClient, amplifyReady } from './amplifyClient.js'
import { fallbackPosts } from '../data.js'

function fallbackList(board) {
  return fallbackPosts.filter((p) => p.board === board)
}

function parseAttachments(raw) {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// DynamoDB 모델 → 기존 UI 형태(snake_case 필드명 유지)로 매핑
function mapRow(r) {
  return {
    id: r.id,
    board: r.board,
    category: r.category || '',
    title: r.title,
    department: r.department || '',
    phone: r.phone || '',
    duration: r.duration || '',
    fee: r.fee || '',
    how_to_apply: r.howToApply || '',
    required_docs: r.requiredDocs || '',
    steps: r.steps || '',
    related_law: r.relatedLaw || '',
    etc_note: r.etcNote || '',
    content: r.content || '',
    attachments: parseAttachments(r.attachments),
    views: r.views ?? 0,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }
}

// 게시판 목록 (활성, 최신순)
export async function fetchPosts(board) {
  if (!amplifyReady) return { posts: fallbackList(board), fallback: true }
  try {
    const { data, errors } = await publicClient.models.Post.list({
      filter: { board: { eq: board }, isActive: { eq: true } },
      limit: 500,
    })
    if (errors?.length) throw new Error(errors[0]?.message || 'list failed')
    const rows = (data || [])
      .map(mapRow)
      .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
    return { posts: rows, fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[postsApi] 게시물 목록을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { posts: fallbackList(board), fallback: true }
  }
}

// 게시물 상세
export async function fetchPost(board, id) {
  const fromFallback = () => fallbackList(board).find((p) => String(p.id) === String(id)) || null
  if (!amplifyReady) return { post: fromFallback(), fallback: true }
  try {
    const { data, errors } = await publicClient.models.Post.get({ id })
    if (errors?.length || !data || data.board !== board || data.isActive === false) {
      throw new Error(errors?.[0]?.message || 'not found')
    }
    return { post: mapRow(data), fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[postsApi] 게시물을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { post: fromFallback(), fallback: true }
  }
}

// 조회수 증가 (실패 무시)
export function incrementPostViews(id) {
  if (!amplifyReady) return
  publicClient.mutations
    .incrementPostViews({ id })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[postsApi] 조회수 증가 실패:', err?.message)
    })
}

// YYYY.MM.DD
export function formatPostDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${mm}.${dd}`
}
