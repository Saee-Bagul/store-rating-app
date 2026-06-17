'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return null }
      return r.json()
    }).then(u => {
      if (u && u.role !== 'admin') router.push('/login')
    })
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [router])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Admin Dashboard</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>System Overview</span>
        </div>
        <div className="page-body">
          {loading ? <div className="spinner" /> : (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registered accounts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Stores</div>
                  <div className="stat-value">{stats?.totalStores ?? 0}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registered stores</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Ratings</div>
                  <div className="stat-value">{stats?.totalRatings ?? 0}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ratings submitted</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/admin/users')}>
                  <h3 style={{ marginBottom: 8 }}>👥 Manage Users</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add, view and filter all users on the platform.</p>
                  <div style={{ marginTop: 16 }}><span className="btn btn-secondary btn-sm">View Users →</span></div>
                </div>
                <div className="card" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/admin/stores')}>
                  <h3 style={{ marginBottom: 8 }}> Manage Stores</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add, view and filter all registered stores.</p>
                  <div style={{ marginTop: 16 }}><span className="btn btn-secondary btn-sm">View Stores →</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
