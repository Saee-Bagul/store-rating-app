'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${i <= (hover || value) ? 'star-filled' : 'star-empty'}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </span>
  )
}

function StarDisplay({ value }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= value ? 'star-filled' : 'star-empty'}`} style={{fontSize:15,cursor:'default'}}>★</span>
      ))}
    </span>
  )
}

export default function StoresPage() {
  const router = useRouter()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ name: '', address: '' })
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' })
  const [ratingModal, setRatingModal] = useState(null)
  const [ratingVal, setRatingVal] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingMsg, setRatingMsg] = useState('')

  const fetchStores = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ ...filters, sortBy: sort.by, sortDir: sort.dir })
    const res = await fetch(`/api/stores?${params}`)
    if (res.status === 401) { router.push('/login'); return }
    setStores(await res.json()); setLoading(false)
  }, [filters, sort, router])

  useEffect(() => { fetchStores() }, [fetchStores])

  function openRating(store) {
    setRatingModal(store)
    setRatingVal(store.user_rating || 0)
    setRatingMsg('')
  }

  async function submitRating() {
    if (!ratingModal || ratingVal === 0) return
    setRatingLoading(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: ratingModal.id, rating: ratingVal }),
    })
    const data = await res.json()
    setRatingLoading(false)
    if (res.ok) {
      setRatingMsg(data.message)
      fetchStores()
      setTimeout(() => { setRatingModal(null); setRatingMsg('') }, 1200)
    } else {
      setRatingMsg(data.error)
    }
  }

  const SortBtn = ({ col, label }) => (
    <button className="btn btn-secondary btn-sm"
      style={{ fontSize: 12, padding: '4px 10px', background: sort.by === col ? 'var(--accent-light)' : undefined }}
      onClick={() => setSort(s => ({ by: col, dir: s.by === col && s.dir === 'asc' ? 'desc' : 'asc' }))}>
      {label} {sort.by === col ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
    </button>
  )

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>🏪 Browse Stores</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stores.length} stores found</span>
        </div>
        <div className="page-body">
          <div className="filter-bar" style={{ marginBottom: 12 }}>
            <input placeholder="Search by store name…" value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })} />
            <input placeholder="Search by address…" value={filters.address}
              onChange={e => setFilters({ ...filters, address: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort:</span>
            <SortBtn col="name" label="Name" />
            <SortBtn col="address" label="Address" />
            <SortBtn col="avg_rating" label="Rating" />
          </div>

          {loading ? <div className="spinner" /> : stores.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>🏪</div>
              <p>No stores found matching your search.</p>
            </div>
          ) : (
            <div className="store-grid">
              {stores.map(store => (
                <div key={store.id} className="store-card">
                  <div className="store-card-name">{store.name}</div>
                  <div className="store-card-address">📍 {store.address || 'No address'}</div>
                  <div className="store-card-stats">
                    <div className="store-card-avg">{store.avg_rating ?? '—'}</div>
                    {store.avg_rating
                      ? <StarDisplay value={Math.round(store.avg_rating)} />
                      : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No ratings yet</span>}
                    <span className="store-card-count">({store.rating_count} ratings)</span>
                  </div>
                  {store.user_rating ? (
                    <div className="store-card-user-rating">
                      Your rating: <StarDisplay value={store.user_rating} />
                      <strong style={{ marginLeft: 6 }}>{store.user_rating}/5</strong>
                    </div>
                  ) : (
                    <div className="store-card-user-rating" style={{ color: 'var(--text-muted)' }}>
                      You haven&apos;t rated this store yet
                    </div>
                  )}
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => openRating(store)}>
                    {store.user_rating ? '✏️ Modify Rating' : '⭐ Submit Rating'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {ratingModal && (
          <div className="modal-overlay" onClick={() => setRatingModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
              <div className="modal-header">
                <h3>{ratingModal.user_rating ? 'Modify Rating' : 'Submit Rating'}</h3>
                <button className="modal-close" onClick={() => setRatingModal(null)}>✕</button>
              </div>
              <p style={{ marginBottom: 6, fontWeight: 600 }}>{ratingModal.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                Select your rating below (1 = Poor, 5 = Excellent)
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <StarPicker value={ratingVal} onChange={setRatingVal} />
              </div>
              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--star)' }}>
                {ratingVal > 0 ? `${ratingVal}/5` : 'Select a rating'}
              </p>
              {ratingMsg && <div className={`alert ${ratingMsg.toLowerCase().includes('error') ? 'alert-error' : 'alert-success'}`}>{ratingMsg}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}
                  onClick={submitRating} disabled={ratingVal === 0 || ratingLoading}>
                  {ratingLoading ? 'Submitting...' : 'Confirm Rating'}
                </button>
                <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
