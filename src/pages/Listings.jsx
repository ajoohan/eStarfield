import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchListings } from '../lib/listingsApi.js'
import SectionTitle from '../components/SectionTitle.jsx'
import ListingFilter from '../components/ListingFilter.jsx'
import ListingCard from '../components/ListingCard.jsx'
import ListingModal from '../components/ListingModal.jsx'

export default function Listings() {
  const [params] = useSearchParams()
  const [type, setType] = useState('all')
  const [deal, setDeal] = useState('all')
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = params.get('type')
    if (t) setType(t)
  }, [params])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchListings().then((data) => {
      if (cancelled) return
      setItems(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = items.filter(
    (l) => (type === 'all' || l.typeKey === type) && (deal === 'all' || l.dealKey === deal),
  )

  return (
    <div className="page">
      <SectionTitle eyebrow="LISTINGS" title="매물정보" sub="유형과 거래방식으로 원하는 매물을 찾아보세요." />
      <ListingFilter type={type} deal={deal} onType={setType} onDeal={setDeal} />
      {loading ? (
        <p className="empty">매물을 불러오는 중입니다…</p>
      ) : filtered.length === 0 ? (
        <p className="empty">해당 조건의 매물이 없습니다. 전화로 문의 주시면 맞는 매물을 찾아드립니다.</p>
      ) : (
        <div className="listing-grid">
          {filtered.map((l) => <ListingCard key={l.id} item={l} onClick={setSelected} />)}
        </div>
      )}
      <ListingModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
