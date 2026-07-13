import { supabase, supabaseReady } from './supabase.js'
import { listings as staticListings } from '../data.js'

export async function fetchListings() {
  if (!supabaseReady) return staticListings

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[listingsApi] Supabase에서 매물을 불러오지 못해 정적 데이터로 대체합니다.', error)
      return staticListings
    }

    return data.map((row) => ({
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
    }))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[listingsApi] 매물 조회 중 오류가 발생해 정적 데이터로 대체합니다.', err)
    return staticListings
  }
}
