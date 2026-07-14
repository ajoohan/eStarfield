import { supabase, supabaseReady } from './supabase.js'
import { fallbackPosts } from '../data.js'

function fallbackList(board) {
  return fallbackPosts.filter((p) => p.board === board)
}

// 게시판 목록 (활성 게시물, 최신순)
export async function fetchPosts(board) {
  if (!supabaseReady) return { posts: fallbackList(board), fallback: true }
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, board, category, title, department, attachments, views, created_at, updated_at')
      .eq('board', board)
      .eq('is_active', true)
      .order('id', { ascending: false })
    if (error) throw error
    return { posts: data || [], fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[postsApi] 게시물 목록을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { posts: fallbackList(board), fallback: true }
  }
}

// 게시물 상세
export async function fetchPost(board, id) {
  const fromFallback = () => fallbackList(board).find((p) => String(p.id) === String(id)) || null
  if (!supabaseReady) return { post: fromFallback(), fallback: true }
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('board', board)
      .eq('id', id)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return { post: data, fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[postsApi] 게시물을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { post: fromFallback(), fallback: true }
  }
}

// 조회수 증가 (실패해도 무시)
export function incrementPostViews(id) {
  if (!supabaseReady) return
  supabase
    .rpc('increment_post_views', { pid: id })
    .then(({ error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[postsApi] 조회수 증가 실패:', error.message)
      }
    })
}

// 첨부파일 공개 URL (download=true 시 다운로드 URL)
export function postFileUrl(path, downloadName) {
  const { data } = supabase.storage
    .from('post-files')
    .getPublicUrl(path, downloadName ? { download: downloadName } : undefined)
  return data?.publicUrl || ''
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
