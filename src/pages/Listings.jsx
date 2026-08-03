import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchListings } from '../lib/listingsApi.js'
import SectionTitle from '../components/SectionTitle.jsx'
import ListingFilter from '../components/ListingFilter.jsx'
import ListingCard from '../components/ListingCard.jsx'
import ListingModal from '../components/ListingModal.jsx'
import LoadErrorBox from '../components/LoadErrorBox.jsx'

const PAGE_SIZE = 12

export default function Listings() {
  const [params] = useSearchParams()
  const [type, setType] = useState('all')
  const [deal, setDeal] = useState('all')
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    const t = params.get('type')
    if (t) setType(t)
  }, [params])

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [type, deal])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchListings().then(({ listings, error }) => {
      if (cancelled) return
      setItems(listings)
      setLoadError(error)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = items.filter(
    (l) => (type === 'all' || l.typeKey === type) && (deal === 'all' || l.dealKey === deal),
  )
  const shown = filtered.slice(0, visible)

  return (
    <div className="page">
      <SectionTitle eyebrow="LISTINGS" title="매물정보" sub={'유형과 거래방식으로 원하는 매물을\n찾아보세요.'} />
      <ListingFilter type={type} deal={deal} onType={setType} onDeal={setDeal} />
      {loading ? (
        <p className="empty">매물을 불러오는 중입니다…</p>
      ) : loadError ? (
        <LoadErrorBox />
      ) : filtered.length === 0 ? (
        <p className="empty">해당 조건의 매물이 없습니다. 전화로 문의 주시면 맞는 매물을 찾아드립니다.</p>
      ) : (
        <>
          <p className="listing-count">
            전체 <b>{filtered.length}</b>건
          </p>
          <div className="listing-grid">
            {shown.map((l) => <ListingCard key={l.id} item={l} onClick={setSelected} />)}
          </div>
          {filtered.length > visible && (
            <div className="center-mt">
              <button
                type="button"
                className="btn btn-navy"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                매물 더보기 ({filtered.length - visible}건)
              </button>
            </div>
          )}
        </>
      )}
      <ListingModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
