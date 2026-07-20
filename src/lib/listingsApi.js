import { publicClient, amplifyReady } from './amplifyClient.js'
import { resolveFileUrl } from './storage.js'
import { listings as staticListings } from '../data.js'

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

export async function fetchListings() {
  if (!amplifyReady) return staticListings.map(withThumbDefault)

  try {
    const { data, errors } = await publicClient.models.Listing.list({
      filter: { isActive: { eq: true } },
      limit: 500,
    })
    if (errors?.length || !data || data.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[listingsApi] 매물을 불러오지 못해 정적 데이터로 대체합니다.', errors)
      return staticListings.map(withThumbDefault)
    }

    const rows = [...data].sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0))
    return Promise.all(
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[listingsApi] 매물 조회 중 오류 — 정적 데이터로 대체합니다.', err)
    return staticListings.map(withThumbDefault)
  }
}
