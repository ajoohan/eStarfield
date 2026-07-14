import { supabase, supabaseReady } from './supabase.js'
import { listings as staticListings } from '../data.js'

// 대표 이미지가 없는 매물에 적용할 유형별 더미 사진 (관리자에서 사진 등록 시 그 사진이 우선)
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
  if (!supabaseReady) return staticListings.map(withThumbDefault)

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[listingsApi] Supabase에서 매물을 불러오지 못해 정적 데이터로 대체합니다.', error)
      return staticListings.map(withThumbDefault)
    }

    return data.map((row) =>
      withThumbDefault({
        id: row.id,
        title: row.title,
        typeKey: row.type_key,
        dealKey: row.deal_key,
        area: row.area,
        price: row.price,
        deposit: row.deposit,
        monthly: row.monthly,
        location: row.location,
        floor: row.floor,
        desc: row.description,
        thumb: row.thumb,
      }),
    )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[listingsApi] 매물 조회 중 오류가 발생해 정적 데이터로 대체합니다.', err)
    return staticListings.map(withThumbDefault)
  }
}
