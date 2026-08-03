import { publicClient, amplifyReady } from './amplifyClient.js'
import { resolveFileUrl } from './storage.js'

// 대표 이미지가 없는 매물에 적용할 유형별 더미 사진
const DUMMY_THUMBS = {
  store: '/dummy/store.jpg',
  office: '/dummy/office.jpg',
  home: '/dummy/home.jpg',
  land: '/dummy/land.jpg',
}

function withThumbDefault(item) {
  return { ...item, thumb: item.thumb || DUMMY_THUMBS[item.typeKey] || '' }
}

/**
 * 매물 목록을 가져온다.
 * 실패하면 빈 목록 + error=true 를 돌려준다.
 * 실제로 존재하지 않는 예시 매물을 대신 보여주면 고객이 없는 매물로 문의하게 되므로
 * 폴백 데이터를 쓰지 않는다.
 * @returns {Promise<{ listings: object[], error: boolean }>}
 */
export async function fetchListings() {
  if (!amplifyReady) return { listings: [], error: true }

  try {
    const { data, errors } = await publicClient.models.Listing.list({
      filter: { isActive: { eq: true } },
      limit: 500,
    })
    if (errors?.length) throw new Error(errors[0]?.message || 'list failed')

    const rows = [...(data || [])].sort(
      (x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0) || new Date(y.createdAt) - new Date(x.createdAt),
    )
    const listings = await Promise.all(
      rows.map(async (row) =>
        withThumbDefault({
          id: row.id,
          title: row.title,
          typeKey: row.typeKey,
          dealKey: row.dealKey,
          area: row.area || '',
          price: row.price || '',
          deposit: row.deposit || '',
          monthly: row.monthly || '',
          location: row.location || '',
          floor: row.floor || '',
          desc: row.description || '',
          thumb: await resolveFileUrl(row.thumb || ''),
        }),
      ),
    )
    return { listings, error: false }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[listingsApi] 매물 조회 실패 — 빈 목록으로 처리합니다.', err)
    return { listings: [], error: true }
  }
}
