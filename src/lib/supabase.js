import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수가 없으면(로컬에서 .env 누락 등) 명확히 알려준다.
if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env 를 확인하세요.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')

// Supabase가 실제로 설정되었는지 여부(폴백 처리에 사용)
export const supabaseReady = Boolean(url && anonKey)
