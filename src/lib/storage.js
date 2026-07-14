import { supabase } from './supabase.js'

// 공개 버킷(post-files)에 이미지를 업로드하고 공개 URL을 반환한다.
// folder: 'listings' | 'complexes' | 'posts' 등 경로 접두어
export async function uploadPublicImage(file, folder) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('post-files').upload(key, file)
  if (error) throw new Error(`이미지 업로드 실패 (${file.name}): ${error.message}`)
  const { data } = supabase.storage.from('post-files').getPublicUrl(key)
  return data?.publicUrl || ''
}
