import { publicClient, amplifyReady } from './amplifyClient.js'
import { resolveFileUrl } from './storage.js'
import { complexes as fallbackComplexes } from '../data.js'

export async function fetchComplexes() {
  if (!amplifyReady) return { complexes: fallbackComplexes, fallback: true }
  try {
    const { data, errors } = await publicClient.models.Complex.list({
      filter: { isActive: { eq: true } },
      limit: 500,
    })
    if (errors?.length) throw new Error(errors[0]?.message || 'list failed')
    const rows = await Promise.all(
      [...(data || [])]
        .sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0))
        .map(async (r) => ({
          name: r.name,
          category: r.category || '',
          desc: r.description || '',
          tags: (r.tags || []).filter(Boolean),
          image: await resolveFileUrl(r.image || ''),
        })),
    )
    return { complexes: rows, fallback: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[complexesApi] 단지 목록을 불러오지 못해 기본 안내로 대체합니다.', err)
    return { complexes: fallbackComplexes, fallback: true }
  }
}
