import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수가 없으면(로컬에서 .env 누락 등) 명확히 알려준다.
if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env 를 확인하세요.')
}

// Supabase가 실제로 설정되었는지 여부(모든 호출부는 이 값으로 실제 사용을 판정한다)
export const supabaseReady = Boolean(url && anonKey)

// createClient는 URL이 비어 있으면 즉시 throw → 이 모듈을 import하는 페이지
// 전체가 백스크린이 된다(Home/Listings/Contact/Admin). env 누락 시에도 앱이
// 정적 폴백으로 정상 렌더되도록 형식상 유효한 placeholder를 넣고,
// 실제 네트워크 사용 여부는 supabaseReady 로만 판정한다.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
