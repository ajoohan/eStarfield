import { uploadData, getUrl } from 'aws-amplify/storage'

// S3(public/*)에 이미지를 업로드하고 "경로"를 반환한다. (URL은 resolveFileUrl로 해석)
// folder: 'listings' | 'complexes' | 'posts'
export async function uploadPublicImage(file, folder) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `public/${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  await uploadData({ path, data: file }).result
  return path
}

// 첨부파일 업로드(원본 파일명 유지 메타) — {name, path, size} 반환
export async function uploadPublicFile(file, folder) {
  const path = await uploadPublicImage(file, folder)
  return { name: file.name, path, size: file.size }
}

const urlCache = new Map()

// S3 경로(public/...)면 서명 URL로 해석, 그 외(/dummy/, https://)는 그대로 반환
export async function resolveFileUrl(pathOrUrl) {
  if (!pathOrUrl) return ''
  if (!pathOrUrl.startsWith('public/')) return pathOrUrl
  const cached = urlCache.get(pathOrUrl)
  if (cached && cached.expires > Date.now()) return cached.url
  const { url } = await getUrl({ path: pathOrUrl, options: { expiresIn: 3600 } })
  const resolved = url.toString()
  urlCache.set(pathOrUrl, { url: resolved, expires: Date.now() + 55 * 60 * 1000 })
  return resolved
}
