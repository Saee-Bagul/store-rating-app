'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

export default function AdminStores() {
  const router = useRouter()
  const [stores, setStores] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ name: '', email: '', address: '' })
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchStores = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ ...filters, sortBy: sort.by, sortDir: sort.dir })
    const res = await fetch(`/api/admin/stores?${params}`)
    if (res.status === 403) { router.push('/login'); return }
    setStores(await res.json()); setLoading(false)
  }, [filters, sort, router])

  useEffect(() => { fetchStores() }, [fetchStores])

  useEffect(() => {
    fetch('/api/admin/users?role=store_owner').then(r => r.json()).then(setOwners)
  }, [])

  function toggleSort(col) {
    setSort(s => ({ by: col, dir: s.by === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  async function handleAddStore(e) {
    e.preventDefault(); setFormError(''); setFormSuccess('')
    const body = { ...form, owner_id: form.owner_id ? Number(form.owner_id) : undefined }
    const res = await fetch('/api/admin/stores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error); return }
    setFormSuccess('Store created!'); fetchStores()
    setForm({ name: '', email: '', address: '', owner_id: '' })
    setTimeout(() => { setShowModal(false); setFormSuccess('') }, 1200)
  }

  const SortIcon = ({ col }) => (
    <span className="sort-icon">{sort.by === col ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
  )

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>🏪 Stores Management</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Store</button>
        </div>
        <div className="page-body">
          <div className="filter-bar">
            {['name','email','address'].map(k => (
              <input key={k} placeholder={`Filter by ${k}`} value={filters[k]}
                onChange={e => setFilters({ ...filters, [k]: e.target.value })} />
            ))}
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name','Name'],['email','Email'],['address','Address'],['avg_rating','Rating']].map(([col,label]) => (
                      <th key={col} onClick={() => toggleSort(col)}>{label}<SortIcon col={col} /></th>
                    ))}
                    <th>Owner</th>
                    <th># Ratings</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No stores found</td></tr>
                  ) : stores.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.email}</td>
                      <td>{s.address || '—'}</td>
                      <td>{s.avg_rating ? `⭐ ${s.avg_rating}` : '—'}</td>
                      <td>{s.owner_name || '—'}</td>
                      <td>{s.rating_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Store</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
              <form onSubmit={handleAddStore}>
                <div className="form-group">
                  <label>Store Name (20–60 chars)</label>
                  <input required minLength={20} maxLength={60} placeholder="Enter store name"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>{form.name.length}/60</span>
                </div>
                <div className="form-group">
                  <label>Store Email</label>
                  <input type="email" required placeholder="store@example.com"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address (max 400 chars)</label>
                  <textarea maxLength={400} placeholder="Store address"
                    value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Store Owner (optional)</label>
                  <select value={form.owner_id} onChange={e => setForm({...form, owner_id: e.target.value})}>
                    <option value="">— No Owner —</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button type="submit" className="btn btn-primary" style={{flex:1}}>Create Store</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
