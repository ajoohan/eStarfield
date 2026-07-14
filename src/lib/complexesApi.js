import { supabase, supabaseReady } from './supabase.js'
import { complexes as fallbackComplexes } from '../data.js'

// 주변단지 목록 (활성, 정렬순) — 실패/미설정 시 data.js 폴백
export async function fetchComplexes() {
  if (!supabaseReady) return { complexes: fallbackComplexes, fallback: true }
  try {
    const { data, error } = await supabase
      .from('complexes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    const rows = (data || []).map((r) => ({
      name: r.name,
      category: r.category || '',
      desc: r.description || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
    }))
    return { complexes: rows, fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[complexesApi] 단지 목록을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { complexes: fallbackComplexes, fallback: true }
  }
}
