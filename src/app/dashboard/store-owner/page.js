'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

function StarDisplay({ val }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= val ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </span>
  )
}

export default function StoreOwnerDashboard() {
  const router = useRouter()
  const [store, setStore] = useState(null)
  const [raters, setRaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' })

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({ sortBy: sort.by, sortDir: sort.dir })
    const res = await fetch(`/api/store-owner/dashboard?${params}`)
    if (res.status === 403) { router.push('/login'); return }
    const data = await res.json()
    setStore(data.store); setRaters(data.raters); setLoading(false)
  }, [sort, router])

  useEffect(() => { fetchData() }, [fetchData])

  function toggleSort(col) {
    setSort(s => ({ by: col, dir: s.by === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const SortIcon = ({ col }) => (
    <span className="sort-icon">{sort.by === col ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
  )

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>🏪 My Store Dashboard</h2>
        </div>
        <div className="page-body">
          {loading ? <div className="spinner" /> : !store ? (
            <div className="card">
              <div className="empty-state">
                <div style={{fontSize:48}}>🏪</div>
                <h3 style={{marginBottom:8}}>No store assigned</h3>
                <p>Contact admin to get a store assigned to your account.</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                <div className="card">
                  <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:12,fontWeight:700,textTransform:'uppercase'}}>Store Info</div>
                  <h3 style={{fontSize:20,marginBottom:8}}>{store.name}</h3>
                  <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:4}}>📧 {store.email}</p>
                  <p style={{color:'var(--text-muted)',fontSize:14}}>📍 {store.address || '—'}</p>
                </div>
                <div className="card" style={{display:'flex',flexDirection:'column',gap:16}}>
                  <div>
                    <div className="stat-label">Average Rating</div>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:8}}>
                      <div className="stat-value">{store.avg_rating ?? '—'}</div>
                      {store.avg_rating && <StarDisplay val={Math.round(store.avg_rating)} />}
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Total Ratings</div>
                    <div className="stat-value" style={{fontSize:24}}>{store.rating_count}</div>
                  </div>
                </div>
              </div>

              <div className="section-title">Users Who Rated Your Store</div>
              {raters.length === 0 ? (
                <div className="empty-state">
                  <div style={{fontSize:48}}>⭐</div>
                  <p>No ratings yet. Share your store to get ratings!</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th onClick={() => toggleSort('name')}>User Name <SortIcon col="name" /></th>
                        <th onClick={() => toggleSort('email')}>Email <SortIcon col="email" /></th>
                        <th onClick={() => toggleSort('rating')}>Rating <SortIcon col="rating" /></th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raters.map((r, i) => (
                        <tr key={i}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.email}</td>
                          <td><StarDisplay val={r.rating} /> <span style={{marginLeft:8,fontWeight:700}}>{r.rating}/5</span></td>
                          <td style={{color:'var(--text-muted)',fontSize:13}}>
                            {new Date(r.updated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
