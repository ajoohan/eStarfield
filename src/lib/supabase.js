import { createClient } from '@supabase/supabase-js'

// Supabase 접속 정보.
// 우선순위: 빌드 환경변수(VITE_SUPABASE_*) → 아래 기본값.
// anon(public) 키는 프런트엔드에 노출되도록 설계된 공개 키이며,
// 실제 데이터 보호는 Supabase RLS(행 수준 보안)가 담당한다.
// 따라서 배포 안정성을 위해 기본값으로 포함해도 안전하다
// (환경변수를 설정하면 그 값이 우선한다).
const DEFAULT_SUPABASE_URL = 'https://evziqabxwvpyjlglmuzy.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2emlxYWJ4d3ZweWpsZ2xtdXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MTc3NDYsImV4cCI6MjA5OTQ5Mzc0Nn0.x2H8Q8QHxUKqSEP_K7Jmm_fYeK5zdVfFuG_T7l8-NTU'

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)

// URL·키가 모두 있으면 사용 가능(기본값이 있으므로 항상 true).
export const supabaseReady = Boolean(url && anonKey)
