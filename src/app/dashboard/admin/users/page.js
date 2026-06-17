'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

export default function AdminUsers() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' })
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ ...filters, sortBy: sort.by, sortDir: sort.dir })
    const res = await fetch(`/api/admin/users?${params}`)
    if (res.status === 403) { router.push('/login'); return }
    const data = await res.json()
    setUsers(data); setLoading(false)
  }, [filters, sort, router])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function toggleSort(col) {
    setSort(s => ({ by: col, dir: s.by === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  async function handleAddUser(e) {
    e.preventDefault(); setFormError(''); setFormSuccess('')
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error); return }
    setFormSuccess('User created successfully!')
    setForm({ name: '', email: '', password: '', address: '', role: 'user' })
    fetchUsers()
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
          <h2>👥 Users Management</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add User</button>
        </div>
        <div className="page-body">
          <div className="filter-bar">
            {['name','email','address'].map(k => (
              <input key={k} placeholder={`Filter by ${k}`} value={filters[k]}
                onChange={e => setFilters({ ...filters, [k]: e.target.value })} />
            ))}
            <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          {loading ? <div className="spinner" /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name','Name'],['email','Email'],['address','Address'],['role','Role']].map(([col,label]) => (
                      <th key={col} onClick={() => toggleSort(col)}>{label}<SortIcon col={col} /></th>
                    ))}
                    <th>Store Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.address || '—'}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role.replace('_',' ')}</span></td>
                      <td>{u.role === 'store_owner' && u.store_rating ? `⭐ ${u.store_rating}` : '—'}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(u)}>
                          View
                        </button>
                      </td>
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
                <h3>Add New User</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Full Name (20–60 chars)</label>
                  <input required minLength={20} maxLength={60} placeholder="Enter full name"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>{form.name.length}/60</span>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required placeholder="user@example.com"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password (8–16 chars, 1 uppercase, 1 special)</label>
                  <input type="password" required placeholder="••••••••"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address (max 400 chars)</label>
                  <textarea maxLength={400} placeholder="Address"
                    value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button type="submit" className="btn btn-primary" style={{flex:1}}>Create User</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Details</h3>
                <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {[['Name', selectedUser.name],['Email', selectedUser.email],['Address', selectedUser.address || '—'],
                  ['Role', selectedUser.role]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>{label}</div>
                    <div>{val}</div>
                  </div>
                ))}
                {selectedUser.role === 'store_owner' && (
                  <div>
                    <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>Store Rating</div>
                    <div>{selectedUser.store_rating ? ` ${selectedUser.store_rating}` : 'No ratings yet'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
