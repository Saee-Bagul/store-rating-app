'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function ProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return null }
      return r.json()
    }).then(d => d && setUser(d))
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess('')
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match'); return
    }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess('Password updated successfully!')
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2> Change Password</h2>
        </div>
        <div className="page-body">
          <div style={{ maxWidth: 480 }}>
            {user && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}>Account Info</div>
                <p><strong>Name:</strong> {user.name}</p>
                <p style={{ marginTop: 6 }}><strong>Email:</strong> {user.email}</p>
                <p style={{ marginTop: 6 }}><strong>Role:</strong> <span className={`badge badge-${user.role}`}>{user.role.replace('_', ' ')}</span></p>
              </div>
            )}
            <div className="card">
              <div className="section-title">Update Password</div>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" required placeholder="••••••••"
                    value={form.currentPassword}
                    onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(8–16 chars, 1 uppercase, 1 special)</span></label>
                  <input type="password" required placeholder="••••••••"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" required placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
